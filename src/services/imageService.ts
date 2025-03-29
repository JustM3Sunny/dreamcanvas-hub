
import { Client } from "@gradio/client";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL, listAll, uploadString } from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  increment,
  limit,
  orderBy 
} from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedImage {
  id?: string;
  imageUrl: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: number;
  userId: string;
}

export interface UserLimit {
  id?: string;
  userId: string;
  imagesGenerated: number;
  imagesLimit: number;
  tier: string;
  lastRefresh: Date;
}

const IMAGE_TIERS = {
  FREE: {
    limit: 5,
    resolution: "512x512",
    styles: ["photorealistic", "digital-art", "illustration"],
  },
  BASIC: {
    limit: 15,
    resolution: "1024x1024",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art"],
  },
  PRO: {
    limit: 50,
    resolution: "2048x2048",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art", "anime", "ghibli"],
  },
  UNLIMITED: {
    limit: 1000,
    resolution: "4096x4096",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art", "anime", "ghibli", "watercolor", "oil-painting", "concept-art", "cyberpunk", "fantasy"],
  }
};

// Initialize Gemini AI
const initGemini = () => {
  const API_KEY = process.env.VITE_GEMINI_API_KEY || localStorage.getItem("GEMINI_API_KEY");
  if (!API_KEY) return null;
  
  try {
    return new GoogleGenerativeAI(API_KEY);
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
    return null;
  }
};

// Check user limits
export async function checkUserLimit(userId: string): Promise<UserLimit | null> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    const userLimitDoc = await getDoc(userLimitRef);
    
    if (userLimitDoc.exists()) {
      const userData = userLimitDoc.data() as UserLimit;
      
      // Check if it's a new day and should refresh
      const lastRefresh = userData.lastRefresh ? new Date(userData.lastRefresh) : new Date(0);
      const today = new Date();
      if (lastRefresh.toDateString() !== today.toDateString()) {
        // Reset daily count
        await updateDoc(userLimitRef, {
          imagesGenerated: 0,
          lastRefresh: today
        });
        
        return {
          ...userData,
          imagesGenerated: 0,
          lastRefresh: today
        };
      }
      
      return {
        ...userData,
        id: userLimitDoc.id
      };
    } else {
      // Create new user limit document (default to FREE tier)
      const newUserLimit: UserLimit = {
        userId,
        imagesGenerated: 0,
        imagesLimit: IMAGE_TIERS.FREE.limit,
        tier: 'FREE',
        lastRefresh: new Date()
      };
      
      await setDoc(userLimitRef, newUserLimit);
      return newUserLimit;
    }
  } catch (error) {
    console.error("Error checking user limits:", error);
    return null;
  }
}

// Increment user's image generation count
async function incrementUserGenerationCount(userId: string): Promise<boolean> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    
    // Use atomic increment operation
    await updateDoc(userLimitRef, {
      imagesGenerated: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error("Error incrementing generation count:", error);
    return false;
  }
}

// Base generation function
export async function generateImage(
  prompt: string, 
  style: string = 'photorealistic',
  aspectRatio: string = '1:1', 
  userId: string
): Promise<GeneratedImage> {
  try {
    // Check user limits
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user limits");
    }
    
    if (userLimit.imagesGenerated >= userLimit.imagesLimit) {
      throw new Error(`You've reached your daily limit of ${userLimit.imagesLimit} images. Upgrade your plan for more!`);
    }
    
    // Apply special prompt modifications for styles
    let finalPrompt = prompt;
    let clientModel = "Rooc/FLUX-Fast"; // default model
    
    // Special handling for Ghibli style
    if (style === 'ghibli') {
      finalPrompt = `Create a Studio Ghibli style animation scene with: ${prompt}. Use Ghibli's signature soft colors, detailed backgrounds, and whimsical elements.`;
      // We'd use a specific Ghibli-tuned model in a real implementation
    } else if (style === 'anime') {
      finalPrompt = `Generate an anime-style image with: ${prompt}. Use vibrant colors, distinctive anime character features, and dynamic composition.`;
    }
    
    // Enhance the prompt with style and aspect ratio
    const enhancedPrompt = `Generate a ${style} style image with aspect ratio ${aspectRatio} of: ${finalPrompt}`;
    
    toast.info("Generating your image...");
    
    // Connect to the Gradio client
    const client = await Client.connect(clientModel);
    
    // Call the predict function
    const result = await client.predict("/predict", {
      param_0: enhancedPrompt,
    });
    
    console.log("API Raw Response:", result);
    
    // Validate and extract image URL
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error("Invalid response: No data received");
    }
    
    const imageUrl = result.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL received in response");
    }
    
    console.log("Image URL:", imageUrl);
    
    // Create a unique filename based on timestamp
    const timestamp = Date.now();
    
    // Increment user's generation count
    await incrementUserGenerationCount(userId);
    
    // Save image metadata to Firestore
    const imageData: GeneratedImage = {
      imageUrl: imageUrl,
      prompt,
      style,
      aspectRatio,
      createdAt: timestamp,
      userId
    };
    
    const docRef = await addDoc(collection(db, 'images'), imageData);
    
    toast.success("Image generated successfully!");
    
    return {
      ...imageData,
      id: docRef.id
    };
  } catch (error: any) {
    console.error("Error generating image:", error);
    toast.error(error.message || "Failed to generate image");
    throw new Error(error.message || "Failed to generate image");
  }
}

// Alternative image generation with enhanced capabilities
export async function enhancedImageGeneration(
  prompt: string, 
  userId: string,
  options = {
    quality: "ultra-high" as "standard" | "high" | "ultra-high" | "max",
    aspectRatio: "1:1" as string, 
    style: "photorealistic" as string,
    detailLevel: "16k" as string,
  }
): Promise<GeneratedImage> {
  try {
    // Check if style is available for user's tier
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user subscription tier");
    }
    
    // Get available styles for the user's tier
    const availableStyles = IMAGE_TIERS[userLimit.tier as keyof typeof IMAGE_TIERS]?.styles || IMAGE_TIERS.FREE.styles;
    
    // If requested style is not available for this tier
    if (!availableStyles.includes(options.style)) {
      throw new Error(`The "${options.style}" style is not available on your current plan. Please upgrade to access this style.`);
    }
    
    // Enhance the prompt with quality instructions
    const enhancedPrompt = `Generate a ${options.detailLevel} resolution, ${options.quality} quality, ${options.style} style image with aspect ratio ${options.aspectRatio} of: ${prompt}`;
    
    toast.info("Generating enhanced image...");
    
    return generateImage(enhancedPrompt, options.style, options.aspectRatio, userId);
  } catch (error: any) {
    console.error("Error with enhanced image generation:", error);
    toast.error(error.message || "Enhanced generation failed");
    
    // If it's not a tier limitation error, try with standard method
    if (!error.message.includes("not available on your current plan")) {
      toast.info("Trying standard method instead...");
      return generateImage(prompt, "photorealistic", "1:1", userId);
    }
    
    throw error; // Re-throw the error for the caller to handle
  }
}

// Generate from image using Gemini Vision
export async function generateFromImage(
  imageFile: File, 
  userId: string,
  options = {
    style: "match-original" as string,
    enhancePrompt: true as boolean
  }
): Promise<{ image: GeneratedImage, analyzedPrompt: string }> {
  try {
    // Check user limits
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user limits");
    }
    
    if (userLimit.imagesGenerated >= userLimit.imagesLimit) {
      throw new Error(`You've reached your daily limit of ${userLimit.imagesLimit} images. Upgrade your plan for more!`);
    }
    
    toast.info("Analyzing your image...");
    
    // Upload image to Firebase Storage temporarily for analysis
    const imageRef = ref(storage, `temp/${userId}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    
    // Initialize Gemini AI for image analysis
    const genAI = initGemini();
    if (!genAI) {
      throw new Error("Gemini AI is not configured properly. Please check your API key.");
    }
    
    // Convert image to base64 for Gemini
    const fileReader = new FileReader();
    const imageBase64Promise = new Promise<string>((resolve, reject) => {
      fileReader.onload = () => {
        const result = fileReader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error("Failed to convert image to Base64"));
        }
      };
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsDataURL(imageFile);
    });
    
    const imageBase64 = await imageBase64Promise;
    
    // Get a Gemini model with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Analyze the image
    const result = await model.generateContent([
      imageBase64,
      "Analyze this image in detail and create a descriptive prompt that would generate a similar image. Include all visual elements, style, colors, composition, and mood. Be specific and detailed but concise."
    ]);
    
    const analyzedText = result.response.text();
    console.log("Gemini Analysis:", analyzedText);
    
    toast.success("Image analyzed! Generating similar image...");
    
    // Now generate a new image based on the analysis
    let promptToUse = analyzedText;
    if (options.style !== "match-original") {
      promptToUse = `${analyzedText} Render this in ${options.style} style.`;
    }
    
    // Generate the image
    const generatedImage = await generateImage(
      promptToUse,
      options.style === "match-original" ? "photorealistic" : options.style,
      "1:1", // default aspect ratio
      userId
    );
    
    return {
      image: generatedImage,
      analyzedPrompt: analyzedText
    };
  } catch (error: any) {
    console.error("Error generating from image:", error);
    toast.error(error.message || "Failed to generate from image");
    throw error;
  }
}

export async function enhancePrompt(prompt: string): Promise<string> {
  try {
    // Use Gemini AI if available
    const genAI = initGemini();
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(`Enhance this image generation prompt to make it more detailed and effective for AI image generation: "${prompt}". Add more specific details about style, lighting, composition, mood, but keep the core idea intact. Be concise.`);
      
      return result.response.text();
    }
    
    // Fallback to simple enhancement
    const enhancers = [
      "highly detailed",
      "professional quality",
      "sharp focus",
      "intricate details",
      "beautiful composition"
    ];
    
    const randomEnhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
    return `${prompt}, ${randomEnhancer}`;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt; // Return original prompt if enhancement fails
  }
}

export function isImageGenerationPrompt(prompt: string): boolean {
  // Convert to lowercase for case-insensitive matching
  const lowerPrompt = prompt.toLowerCase();
  
  // Image generation phrases in multiple languages
  const imageRelatedTerms = [
    // English - more specific phrases
    "create an image", "generate an image", "draw a picture", "picture of",
    "create a picture", "generate a picture", "visualize", "show me an image",
    "create a visual", "design an image", "generate a photo", "can you create an image",
    "can you draw", "create a scene", "illustrate", "render an image", "generate art",
    "create art", "show a picture", "photo of", 
    
    // Hindi/Transliterated terms
    "photo banao", "tasveer banao", "chitra banao", "image banao", "picture banao",
    "ek photo", "ek tasveer", "ek chitra", "dikhao", "bana do", "create karo"
  ];
  
  // More sophisticated detection using various patterns
  return (
    // Check if any image-related term is in the prompt
    imageRelatedTerms.some(term => lowerPrompt.includes(term)) ||
    
    // Check for common phrases that request visuals
    /how .{1,20} looks?/i.test(prompt) ||
    /what .{1,20} looks? like/i.test(prompt) ||
    /show .{1,20} (of|about)/i.test(prompt) ||
    /(create|make|generate|show) .{1,30} (picture|image|photo|visual|illustration)/i.test(prompt)
  );
}

export async function getUserImages(userId: string): Promise<GeneratedImage[]> {
  try {
    const imagesRef = collection(db, 'images');
    const q = query(imagesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const images: GeneratedImage[] = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data() as Omit<GeneratedImage, 'id'>
      });
    });
    
    return images;
  } catch (error) {
    console.error("Error fetching user images:", error);
    return [];
  }
}

// Get user's latest generated images
export async function getLatestUserImages(userId: string, count: number = 4): Promise<GeneratedImage[]> {
  try {
    const imagesRef = collection(db, 'images');
    const q = query(
      imagesRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    
    const images: GeneratedImage[] = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data() as Omit<GeneratedImage, 'id'>
      });
    });
    
    return images;
  } catch (error) {
    console.error("Error fetching latest user images:", error);
    return [];
  }
}

// Get user subscription info
export async function getUserSubscription(userId: string): Promise<UserLimit> {
  const userLimit = await checkUserLimit(userId);
  if (!userLimit) {
    // Return default free tier if no data exists
    return {
      userId,
      imagesGenerated: 0,
      imagesLimit: IMAGE_TIERS.FREE.limit,
      tier: 'FREE',
      lastRefresh: new Date()
    };
  }
  return userLimit;
}

// Update user subscription tier
export async function updateUserSubscription(userId: string, tier: string): Promise<boolean> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    
    // Get tier limits
    const tierConfig = IMAGE_TIERS[tier as keyof typeof IMAGE_TIERS];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    
    await updateDoc(userLimitRef, {
      tier: tier,
      imagesLimit: tierConfig.limit
    });
    
    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    return false;
  }
}
