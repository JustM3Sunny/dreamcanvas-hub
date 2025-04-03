
import { Client } from "@gradio/client";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
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
    styles: ["photorealistic", "digital-art", "illustration"]
  },
  BASIC: {
    limit: 15,
    tokens: 100000,
    resolution: "1024x1024",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art"]
  },
  PRO: {
    limit: 50,
    tokens: 500000,
    resolution: "2048x2048",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art", "anime", "watercolor"]
  },
  UNLIMITED: {
    limit: 1000,
    tokens: 2000000,
    resolution: "4096x4096",
    styles: ["photorealistic", "digital-art", "illustration", "3d-render", "pixel-art", "anime", "watercolor", "oil-painting", "concept-art", "cyberpunk", "fantasy"]
  }
};

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

const shouldResetLimit = (lastRefresh: Date): boolean => {
  if (!lastRefresh) return true;
  
  const lastRefreshDate = new Date(lastRefresh);
  const now = new Date();
  
  // Check if it's been at least 24 hours since last refresh
  const hoursSinceLastRefresh = (now.getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastRefresh >= 24;
};

export async function checkUserLimit(userId: string): Promise<UserLimit | null> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    const userLimitDoc = await getDoc(userLimitRef);
    
    if (userLimitDoc.exists()) {
      const userData = userLimitDoc.data() as UserLimit;
      
      const lastRefresh = userData.lastRefresh ? new Date(userData.lastRefresh) : new Date(0);
      
      // Check if we need to reset the limit (24 hours have passed)
      if (shouldResetLimit(lastRefresh)) {
        const updatedData = {
          imagesGenerated: 0,
          lastRefresh: new Date()
        };
        
        await updateDoc(userLimitRef, updatedData);
        
        return {
          ...userData,
          ...updatedData,
          id: userLimitDoc.id
        };
      }
      
      return {
        ...userData,
        id: userLimitDoc.id
      };
    } else {
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

async function incrementUserGenerationCount(userId: string, style: string, tokensUsed: number = 0): Promise<boolean> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    
    const updateData: Record<string, any> = {
      imagesGenerated: increment(1),
      totalTokensUsed: increment(tokensUsed)
    };
    
    await updateDoc(userLimitRef, updateData);
    await updateGenerationAnalytics();
    
    return true;
  } catch (error) {
    console.error("Error incrementing generation count:", error);
    return false;
  }
}

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

async function trackPromptTerms(prompt: string): Promise<void> {
  try {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'with', 'of', 'to', 'for'];
    const words = prompt.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    
    const promptRef = doc(db, 'analytics', 'prompts');
    const promptDoc = await getDoc(promptRef);
    
    if (promptDoc.exists()) {
      const data = promptDoc.data() as Record<string, number>;
      const updatedData = { ...data };
      
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

export async function getUsageStatistics(): Promise<UsageStats> {
  try {
    const analyticsRef = doc(db, 'analytics', 'imageGeneration');
    const analyticsDoc = await getDoc(analyticsRef);
    const totalGenerated = analyticsDoc.exists() ? (analyticsDoc.data()?.totalGenerations || 0) : 0;
    
    const styleRef = doc(db, 'analytics', 'styles');
    const styleDoc = await getDoc(styleRef);
    const styleBreakdown = styleDoc.exists() ? styleDoc.data() as Record<string, number> : {};
    
    const userLimitsRef = collection(db, 'userLimits');
    const userSnapshot = await getDocs(userLimitsRef);
    const userCount = userSnapshot.size;
    
    const promptRef = doc(db, 'analytics', 'prompts');
    const promptDoc = await getDoc(promptRef);
    const promptData = promptDoc.exists() ? promptDoc.data() as Record<string, number> : {};
    
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

async function run() {
  // Your code here
}

export async function generateImage(
  prompt: string, 
  style: string = 'photorealistic',
  aspectRatio: string = '1:1', 
  userId: string
): Promise<GeneratedImage> {
  try {
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user limits");
    }
    
    if (userLimit.imagesGenerated >= userLimit.imagesLimit) {
      throw new Error(`You've reached your daily limit of ${userLimit.imagesLimit} images. Your quota will renew in 24 hours.`);
    }
    
    let finalPrompt = prompt;
    let clientModel = "Rooc/FLUX-Fast";
    
    // Enhance prompts based on selected style
    if (style === 'anime') {
      finalPrompt = `Generate an anime-style image with: ${prompt}. Use vibrant colors, distinctive anime character features, and dynamic composition.`;
    } else if (style === 'watercolor') {
      finalPrompt = `Generate a watercolor painting style image with: ${prompt}. Use soft edges, color bleeds, transparent layering, and painterly textures.`;
    } else if (style === 'oil-painting') {
      finalPrompt = `Generate an oil painting style image with: ${prompt}. Use rich textures, visible brushstrokes, deep colors, and classical composition.`;
    } else {
      finalPrompt = `Generate a ${style} style image with aspect ratio ${aspectRatio} of: ${prompt}`;
    }
    
    toast.info("Generating your image...");
    
    const genAI = initGemini();
    let imageUrl = "";
    let tokensUsed = 0;
    
    // Try using Gemini first
    if (genAI) {
      try {
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
        
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `Generate an image: ${finalPrompt}` }] }],
        });
        
        const response = result.response;
        const text = response.text();
        
        const candidate = response.candidates?.[0];
        tokensUsed = 0;
        
        if (candidate) {
          const responseAny = response as any;
          if (responseAny.candidates?.[0]?.usageMetadata?.totalTokens) {
            tokensUsed = responseAny.candidates[0].usageMetadata.totalTokens;
          } else if (responseAny.candidates?.[0]?.tokenCount) {
            tokensUsed = responseAny.candidates[0].tokenCount;
          } else if (responseAny.usage?.totalTokens) {
            tokensUsed = responseAny.usage.totalTokens;
          }
        }
        
        const parts = response.candidates?.[0]?.content?.parts || [];
        const inlineData = parts.find(part => part.inlineData)?.inlineData;
        
        if (inlineData && inlineData.mimeType.startsWith('image/')) {
          const imageRef = ref(storage, `gemini/${userId}/${Date.now()}.jpg`);
          await uploadString(imageRef, inlineData.data, 'base64', { contentType: inlineData.mimeType });
          imageUrl = await getDownloadURL(imageRef);
          console.log("Generated image with Gemini 2.0 Flash");
        }
      } catch (geminiError) {
        console.error("Error generating with Gemini:", geminiError);
        toast.info("Falling back to Gradio for image generation");
      }
    }
    
    // Fallback to Gradio if Gemini failed
    if (!imageUrl) {
      console.log("Falling back to Gradio for image generation");
      const client = await Client.connect(clientModel);
      const result = await client.predict("/predict", {
        param_0: finalPrompt,
      });
      
      console.log("API Raw Response:", result);
      
      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error("Invalid response: No data received");
      }
      
      imageUrl = result.data[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL received in response");
      }
    }
    
    console.log("Image URL:", imageUrl);
    
    await incrementUserGenerationCount(userId, style, tokensUsed);
    
    await trackStyleUsage(style);
    await trackPromptTerms(prompt);
    
    const imageData: GeneratedImage = {
      imageUrl: imageUrl,
      prompt,
      style,
      aspectRatio,
      createdAt: Date.now(),
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
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user subscription tier");
    }
    
    const availableStyles = IMAGE_TIERS[userLimit.tier as keyof typeof IMAGE_TIERS]?.styles || IMAGE_TIERS.FREE.styles;
    
    if (!availableStyles.includes(options.style)) {
      throw new Error(`The "${options.style}" style is not available on your current plan. Please upgrade to access this style.`);
    }
    
    const enhancedPrompt = `Generate a ${options.detailLevel} resolution, ${options.quality} quality, ${options.style} style image with aspect ratio ${options.aspectRatio} of: ${prompt}`;
    
    toast.info("Generating enhanced image...");
    
    return generateImage(enhancedPrompt, options.style, options.aspectRatio, userId);
  } catch (error: any) {
    console.error("Error with enhanced image generation:", error);
    toast.error(error.message || "Enhanced generation failed");
    
    if (!error.message.includes("not available on your current plan")) {
      toast.info("Trying standard method instead...");
      return generateImage(prompt, "photorealistic", "1:1", userId);
    }
    
    throw error;
  }
}

export async function generateFromImage(
  imageFile: File, 
  userId: string,
  options = {
    style: "match-original" as string,
    enhancePrompt: true as boolean
  }
): Promise<{ image: GeneratedImage, analyzedPrompt: string }> {
  try {
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user limits");
    }
    
    if (userLimit.imagesGenerated >= userLimit.imagesLimit) {
      throw new Error(`You've reached your daily limit of ${userLimit.imagesLimit} images. Upgrade your plan for more!`);
    }
    
    toast.info("Analyzing your image...");
    
    // Optimize image size before upload if needed
    let optimizedFile = imageFile;
    if (imageFile.size > 4 * 1024 * 1024) { // If larger than 4MB
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Create a promise to handle the image loading
        const loadImagePromise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image for optimization"));
          img.src = URL.createObjectURL(imageFile);
        });
        
        await loadImagePromise;
        
        // Determine dimensions while maintaining aspect ratio
        const MAX_DIM = 2048;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round(height * (MAX_DIM / width));
            width = MAX_DIM;
          } else {
            width = Math.round(width * (MAX_DIM / height));
            height = MAX_DIM;
          }
        }
        
        if (ctx) {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.85);
          });
          
          if (blob) {
            optimizedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
            console.log(`Image optimized: ${imageFile.size / (1024 * 1024)}MB → ${optimizedFile.size / (1024 * 1024)}MB`);
          }
        }
      } catch (err) {
        console.warn("Image optimization failed, using original:", err);
      }
    }
    
    // Upload the image
    const imageRef = ref(storage, `temp/${userId}/${Date.now()}_${optimizedFile.name}`);
    await uploadBytes(imageRef, optimizedFile);
    const imageUrl = await getDownloadURL(imageRef);
    
    const genAI = initGemini();
    if (!genAI) {
      throw new Error("Gemini AI is not configured properly. Please check your API key.");
    }
    
    // Convert file to base64 for Gemini
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
      fileReader.readAsDataURL(optimizedFile);
    });
    
    const imageBase64 = await imageBase64Promise;
    
    // Use Gemini to analyze the image
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    let analyzedText = "";
    try {
      const result = await model.generateContent([
        imageBase64,
        "Analyze this image in detail and create a comprehensive descriptive prompt that would generate a similar image. Include all visual elements, style, colors, composition, mood, lighting, and background details. Be specific and detailed about what's in the image."
      ]);
      
      analyzedText = result.response.text();
    } catch (error) {
      console.error("Error in first analysis attempt:", error);
      
      // Try with a simplified prompt if the first one fails
      try {
        toast.info("Trying alternative analysis method...");
        const result = await model.generateContent([
          imageBase64,
          "Describe what you see in this image with as much detail as possible."
        ]);
        
        analyzedText = result.response.text();
      } catch (secondError) {
        console.error("Both analysis attempts failed:", secondError);
        throw new Error("Failed to analyze image content. Please try with a different image.");
      }
    }
    
    console.log("Gemini Analysis:", analyzedText);
    
    if (!analyzedText || analyzedText.trim().length < 10) {
      throw new Error("Image analysis produced insufficient description. Please try with a clearer image.");
    }
    
    toast.success("Image analyzed! Generating transformed image...");
    
    // Prepare prompt based on style
    let promptToUse = analyzedText;
    if (options.style !== "match-original") {
      promptToUse = `${analyzedText} Render this in ${options.style} style.`;
    }
    
    // Generate image with the analyzed prompt
    const generatedImage = await generateImage(
      promptToUse,
      options.style === "match-original" ? "photorealistic" : options.style,
      "1:1",
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
    const genAI = initGemini();
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`Enhance this image generation prompt to make it more detailed and effective for AI image generation: "${prompt}". Add more specific details about style, lighting, composition, mood, but keep the core idea intact. Be concise.`);
      
      return result.response.text();
    }
    
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
    return prompt;
  }
}

export function isImageGenerationPrompt(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  
  const imageRelatedTerms = [
    "create an image", "generate an image", "draw a picture", "picture of",
    "create a picture", "generate a picture", "visualize", "show me an image",
    "create a visual", "design an image", "generate a photo", "can you create an image",
    "can you draw", "create a scene", "illustrate", "render an image", "generate art",
    "create art", "show a picture", "photo of", 
    
    "photo banao", "tasveer banao", "chitra banao", "image banao", "picture banao",
    "ek photo", "ek tasveer", "ek chitra", "dikhao", "bana do", "create karo"
  ];
  
  return (
    imageRelatedTerms.some(term => lowerPrompt.includes(term)) ||
    
    /how .{1,20} looks/i.test(prompt) ||
    /what .{1,20} looks like/i.test(prompt) ||
    /show .{1,30} (of|about)/i.test(prompt) ||
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
        toast.error("Firebase index required - Click the link in your console to create the required index", {
          duration: 10000,
          action: {
            label: "Open Console",
            onClick: () => window.open(indexUrlMatch[0], '_blank')
          }
        });
      }
    } else if (error.code === 'permission-denied') {
      toast.error("Firebase permission denied. Please check your Firestore security rules in settings.");
    }
    return [];
  }
}

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

export async function getUserSubscription(userId: string): Promise<UserLimit> {
  const userLimit = await checkUserLimit(userId);
  if (!userLimit) {
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

export async function updateUserSubscription(userId: string, tier: string): Promise<boolean> {
  try {
    const userLimitRef = doc(db, 'userLimits', userId);
    
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

export function getRemainingTimeUntilReset(lastRefresh: Date): string {
  const now = new Date();
  const lastRefreshDate = new Date(lastRefresh);
  const resetTime = new Date(lastRefreshDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after last refresh
  
  const diffMs = resetTime.getTime() - now.getTime();
  if (diffMs <= 0) return "Available now";
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
}

// Create a new function for advanced image manipulations
export async function advancedImageTransformation(
  imageFile: File,
  userId: string,
  options: {
    transformationType: "style-transfer" | "background-removal" | "enhancement" | "upscaling",
    targetStyle?: string,
    enhancementLevel?: "light" | "medium" | "strong",
    upscaleSize?: number
  }
): Promise<{ imageUrl: string }> {
  try {
    // Check user limits first
    const userLimit = await checkUserLimit(userId);
    if (!userLimit) {
      throw new Error("Could not verify user limits");
    }
    
    if (userLimit.imagesGenerated >= userLimit.imagesLimit) {
      throw new Error(`You've reached your daily limit of ${userLimit.imagesLimit} images. Your quota will renew in 24 hours.`);
    }
    
    // Upload original image
    toast.info("Processing your image...");
    const imageRef = ref(storage, `advanced/${userId}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    
    // Process based on transformation type
    let resultUrl = imageUrl; // Default to original if processing fails
    
    switch (options.transformationType) {
      case "style-transfer":
        if (!options.targetStyle) {
          throw new Error("Target style must be specified for style transfer");
        }
        // Here we would implement actual style transfer
        // For now, we'll just return the image-to-image generation
        const result = await generateFromImage(imageFile, userId, {
          style: options.targetStyle,
          enhancePrompt: true
        });
        resultUrl = result.image.imageUrl;
        break;
        
      case "background-removal":
        // For now, use the standard process but you would implement actual bg removal here
        toast.info("Background removal functionality is in development");
        break;
        
      case "enhancement":
        // Image enhancement logic would go here
        toast.info("Image enhancement functionality is in development");
        break;
        
      case "upscaling":
        // Image upscaling logic would go here
        toast.info("Image upscaling functionality is in development");
        break;
    }
    
    // Track the usage
    await incrementUserGenerationCount(userId, "advanced-transform", 0);
    
    return { imageUrl: resultUrl };
  } catch (error: any) {
    console.error("Error in advanced image transformation:", error);
    toast.error(error.message || "Failed to process image");
    throw error;
  }
}
