
import { Client } from "@gradio/client";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';

export interface GeneratedImage {
  id?: string;
  imageUrl: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: number;
  userId: string;
}

// Base generation function
export async function generateImage(
  prompt: string, 
  style: string = 'photorealistic',
  aspectRatio: string = '1:1', 
  userId: string
): Promise<GeneratedImage> {
  try {
    toast.info("Generating your image...");
    
    // Connect to the Gradio client
    const client = await Client.connect("Rooc/FLUX-Fast");
    
    // Enhance the prompt with style and aspect ratio
    const enhancedPrompt = `Generate a ${style} style image with aspect ratio ${aspectRatio} of: ${prompt}`;
    
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
    throw new Error("Failed to generate image");
  }
}

// Alternative image generation with enhanced capabilities
export async function enhancedImageGeneration(
  prompt: string, 
  userId: string,
  options = {
    quality: "ultra-high", // "standard", "high", "ultra-high", "max"
    aspectRatio: "1:1", // "1:1", "16:9", "9:16", "4:3", "3:4"
    style: "photorealistic", // "natural", "vivid", "artistic", "photorealistic"
    detailLevel: "16k", // "4k", "8k", "16k"
  }
): Promise<GeneratedImage> {
  try {
    // Enhance the prompt with quality instructions
    const enhancedPrompt = `Generate a ${options.detailLevel} resolution, ${options.quality} quality, ${options.style} style image with aspect ratio ${options.aspectRatio} of: ${prompt}`;
    
    toast.info("Generating enhanced image...");
    
    return generateImage(enhancedPrompt, options.style, options.aspectRatio, userId);
  } catch (error: any) {
    console.error("Error with enhanced image generation:", error);
    toast.error("Enhanced generation failed, trying standard method...");
    
    // Fall back to regular generation
    return generateImage(prompt, "photorealistic", "1:1", userId);
  }
}

export async function enhancePrompt(prompt: string): Promise<string> {
  try {
    // This is a simplified version of prompt enhancement
    // Add more descriptive elements to the prompt
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
    const q = query(imagesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const images: GeneratedImage[] = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data() as Omit<GeneratedImage, 'id'>
      });
    });
    
    // Sort by creation time, newest first
    return images.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching user images:", error);
    return [];
  }
}
