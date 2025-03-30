
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
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export interface GeneratedImage {
  id?: string;
  imageUrl: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: number;
  userId: string;
  model?: string;
  usageTokens?: number;
}

export interface UserLimit {
  id?: string;
  userId: string;
  imagesGenerated: number;
  imagesLimit: number;
  tier: string;
  lastRefresh: Date;
  totalTokensUsed?: number;
  tokensLimit?: number;
}

export interface UsageStats {
  totalGenerated: number;
  styleBreakdown: Record<string, number>;
  userCount: number;
  averagePerUser: number;
  popularPromptTerms: Array<{term: string, count: number}>;
}

const IMAGE_TIERS = {
  FREE: {
    limit: 5,
    tokens: 25000,
    resolution: "512x512",
    styles: ["photorealistic", "digital-art", "illustration"],
  },
  BASIC: {
    limit: 15,
    tokens: 100000,
    resolution: "1024x1024",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art"],
  },
  PRO: {
    limit: 50,
    tokens: 500000,
    resolution: "2048x2048",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art", "anime", "ghibli"],
  },
  UNLIMITED: {
    limit: 1000,
    tokens: 2000000,
    resolution: "4096x4096",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art", "anime", "ghibli", "watercolor", "oil-painting", "concept-art", "cyberpunk", "fantasy"],
  }
};

// Initialize Gemini AI
const initGemini = () => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 
                  localStorage.getItem("GEMINI_API_KEY") || 
                  "AIzaSyDc7u7wTVdDG3zP18xnELKs0HX7-hImkmc";
  
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
        totalTokensUsed: 0,
        tokensLimit: IMAGE_TIERS.FREE.tokens,
        tier: 'FREE',
        lastRefresh: new Date()
      };
      
      try {
        await setDoc(userLimitRef, newUserLimit);
        return newUserLimit;
      } catch (error: any) {
        console.error("Error creating user limits:", error);
        if (error.code === 'permission-denied') {
          toast.error("Firebase permission denied. Please check your Firestore security rules.");
          throw new Error("Firebase permissions issue - see security rules in settings");
        }
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Error checking user limits:", error);
    if (error.code === 'permission-denied') {
      toast.error("Firebase permission denied. Please check your Firestore security rules in settings.");
      // Return a default limit to prevent app from breaking completely
      return {
        userId,
        imagesGenerated: 0,
        imagesLimit: IMAGE_TIERS.FREE.limit,
        totalTokensUsed: 0,
        tokensLimit: IMAGE_TIERS.FREE.tokens,
        tier: 'FREE',
        lastRefresh: new Date()
      };
    }
    return null;
  }
}

// Increment user's image generation count and token usage
async function incrementUserGenerationCount(userId: string, tokensUsed: number = 0): Promise<boolean> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    
    // Use atomic increment operation
    await updateDoc(userLimitRef, {
      imagesGenerated: increment(1),
      totalTokensUsed: increment(tokensUsed)
    });
    
    // Update analytics data
    await updateGenerationAnalytics();
    
    return true;
  } catch (error) {
    console.error("Error incrementing generation count:", error);
    return false;
  }
}

// Update analytics data
async function updateGenerationAnalytics(): Promise<void> {
  try {
    const analyticsRef = doc(db, 'analytics', 'imageGeneration');
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (analyticsDoc.exists()) {
      await updateDoc(analyticsRef, {
        totalGenerations: increment(1),
        lastUpdated: serverTimestamp()
      });
    } else {
      await setDoc(analyticsRef, {
        totalGenerations: 1,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating analytics:", error);
  }
}

// Track style usage
async function trackStyleUsage(style: string): Promise<void> {
  try {
    const styleRef = doc(db, 'analytics', 'styles');
    const styleDoc = await getDoc(styleRef);
    
    if (styleDoc.exists()) {
      const data = styleDoc.data();
      const updatedData: Record<string, number> = { ...data };
      updatedData[style] = (updatedData[style] || 0) + 1;
      
      await updateDoc(styleRef, updatedData);
    } else {
      await setDoc(styleRef, { [style]: 1 });
    }
  } catch (error) {
    console.error("Error tracking style usage:", error);
  }
}

// Track prompt terms
async function trackPromptTerms(prompt: string): Promise<void> {
  try {
    // Extract meaningful words (exclude common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'with', 'of', 'to', 'for'];
    const words = prompt.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    
    const promptRef = doc(db, 'analytics', 'prompts');
    const promptDoc = await getDoc(promptRef);
    
    if (promptDoc.exists()) {
      const data = promptDoc.data() as Record<string, number>;
      const updatedData = { ...data };
      
      // Update counts for each meaningful word
      words.forEach(word => {
        updatedData[word] = (updatedData[word] || 0) + 1;
      });
      
      await updateDoc(promptRef, updatedData);
    } else {
      const initialData: Record<string, number> = {};
      words.forEach(word => {
        initialData[word] = 1;
      });
      
      await setDoc(promptRef, initialData);
    }
  } catch (error) {
    console.error("Error tracking prompt terms:", error);
  }
}

// Get usage statistics
export async function getUsageStatistics(): Promise<UsageStats> {
  try {
    // Get total generations
    const analyticsRef = doc(db, 'analytics', 'imageGeneration');
    const analyticsDoc = await getDoc(analyticsRef);
    const totalGenerated = analyticsDoc.exists() ? (analyticsDoc.data()?.totalGenerations || 0) : 0;
    
    // Get style breakdown
    const styleRef = doc(db, 'analytics', 'styles');
    const styleDoc = await getDoc(styleRef);
    const styleBreakdown = styleDoc.exists() ? styleDoc.data() as Record<string, number> : {};
    
    // Get user count
    const userLimitsRef = collection(db, 'userLimits');
    const userSnapshot = await getDocs(userLimitsRef);
    const userCount = userSnapshot.size;
    
    // Get popular prompt terms
    const promptRef = doc(db, 'analytics', 'prompts');
    const promptDoc = await getDoc(promptRef);
    const promptData = promptDoc.exists() ? promptDoc.data() as Record<string, number> : {};
    
    // Convert to sorted array
    const popularPromptTerms = Object.entries(promptData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));
    
    return {
      totalGenerated,
      styleBreakdown,
      userCount,
      averagePerUser: userCount > 0 ? totalGenerated / userCount : 0,
      popularPromptTerms
    };
  } catch (error) {
    console.error("Error getting usage statistics:", error);
    return {
      totalGenerated: 0,
      styleBreakdown: {},
      userCount: 0,
      averagePerUser: 0,
      popularPromptTerms: []
    };
  }
}

// Generate image with Gemini 2.0 Flash model
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
    let clientModel = "Rooc/FLUX-Fast"; // default model for Gradio
    
    // Special handling for Ghibli style
    if (style === 'ghibli') {
      finalPrompt = `Create a Studio Ghibli style animation scene with: ${prompt}. Use Ghibli's signature soft colors, detailed backgrounds, and whimsical elements.`;
    } else if (style === 'anime') {
      finalPrompt = `Generate an anime-style image with: ${prompt}. Use vibrant colors, distinctive anime character features, and dynamic composition.`;
    }
    
    // Enhance the prompt with style and aspect ratio
    const enhancedPrompt = `Generate a ${style} style image with aspect ratio ${aspectRatio} of: ${finalPrompt}`;
    
    toast.info("Generating your image...");
    
    // Try to use Gemini first for image generation
    const genAI = initGemini();
    let imageUrl = "";
    let tokensUsed = 0;
    
    if (genAI) {
      try {
        // Use Gemini 2.0 Flash for image generation
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });
        
        // Request image generation with Gemini
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `Generate an image: ${enhancedPrompt}` }] }],
        });
        
        const response = result.response;
        const text = response.text();
        tokensUsed = response.candidates?.[0]?.usageMetadata?.totalTokens || 0;
        
        // Extract image from response - Gemini 2.0 can include inline images
        const parts = response.candidates?.[0]?.content?.parts || [];
        const inlineData = parts.find(part => part.inlineData)?.inlineData;
        
        if (inlineData && inlineData.mimeType.startsWith('image/')) {
          // Upload the base64 image to Firebase Storage
          const imageRef = ref(storage, `gemini/${userId}/${Date.now()}.jpg`);
          await uploadString(imageRef, inlineData.data, 'base64', { contentType: inlineData.mimeType });
          imageUrl = await getDownloadURL(imageRef);
          console.log("Generated image with Gemini 2.0 Flash");
        }
      } catch (geminiError) {
        console.error("Error generating with Gemini:", geminiError);
        // Gemini fallback to Gradio
      }
    }
    
    // If Gemini failed or is not configured, use Gradio
    if (!imageUrl) {
      console.log("Falling back to Gradio for image generation");
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
      
      imageUrl = result.data[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL received in response");
      }
    }
    
    console.log("Image URL:", imageUrl);
    
    // Create a unique filename based on timestamp
    const timestamp = Date.now();
    
    // Increment user's generation count and token usage
    await incrementUserGenerationCount(userId, tokensUsed);
    
    // Track style usage and prompt terms for analytics
    await trackStyleUsage(style);
    await trackPromptTerms(prompt);
    
    // Save image metadata to Firestore
    const imageData: GeneratedImage = {
      imageUrl: imageUrl,
      prompt,
      style,
      aspectRatio,
      createdAt: timestamp,
      userId,
      model: tokensUsed > 0 ? "gemini-2.0-flash" : clientModel,
      usageTokens: tokensUsed
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Analyze the image
    const result = await model.generateContent([
      imageBase64,
      "Analyze this image in detail and create a descriptive prompt that would generate a similar image. Include all visual elements, style, colors, composition, and mood. Be specific and detailed but concise."
    ]);
    
    const analyzedText = result.response.text();
    const tokensUsed = result.response.candidates?.[0]?.usageMetadata?.totalTokens || 0;
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
  } catch (error: any) {
    console.error("Error fetching latest user images:", error);
    if (error.code === 'failed-precondition') {
      const indexUrlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s"]+/);
      if (indexUrlMatch && indexUrlMatch[0]) {
        toast.error(
          <div className="space-y-2">
            <p>Firebase index required</p>
            <p className="text-xs">
              Click the link in your console to create the required index
            </p>
          </div>,
          {
            duration: 10000,
            action: {
              label: "Open Console",
              onClick: () => window.open(indexUrlMatch[0], '_blank')
            }
          }
        );
      }
    } else if (error.code === 'permission-denied') {
      toast.error("Firebase permission denied. Please check your Firestore security rules in settings.");
    }
    return [];
  }
}

// Get all public gallery images
export async function getGalleryImages(pageSize: number = 12, lastImage: GeneratedImage | null = null): Promise<GeneratedImage[]> {
  try {
    const imagesRef = collection(db, 'images');
    let q;
    
    if (lastImage) {
      q = query(
        imagesRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    } else {
      q = query(
        imagesRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
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
    console.error("Error fetching gallery images:", error);
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
      totalTokensUsed: 0,
      tokensLimit: IMAGE_TIERS.FREE.tokens,
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
      imagesLimit: tierConfig.limit,
      tokensLimit: tierConfig.tokens
    });
    
    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    return false;
  }
}
