import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import type { ImageConversationResult } from "../types";
import { analyzeArchitectureImage } from "../services/imageConversationAgent";

interface UseImageConversationReturn {
  imageUri: string | null;
  result: ImageConversationResult | null;
  loading: boolean;
  error: string | null;
  pickImage: () => Promise<void>;
  captureImage: () => Promise<void>;
  analyzeImage: () => Promise<void>;
}

export function useImageConversation(): UseImageConversationReturn {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [result, setResult] = useState<ImageConversationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = useCallback(async () => {
    setError(null);
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      allowsEditing: true,
      mediaTypes: "images" as ImagePicker.MediaType,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setImageUri(pickerResult.assets[0].uri);
      setBase64(pickerResult.assets[0].base64 || null);
      setResult(null);
    }
  }, []);

  const captureImage = useCallback(async () => {
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Camera permission is required to take photos.");
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
      allowsEditing: true,
      mediaTypes: "images" as ImagePicker.MediaType,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setImageUri(pickerResult.assets[0].uri);
      setBase64(pickerResult.assets[0].base64 || null);
      setResult(null);
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!base64) {
      setError("No image selected to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeArchitectureImage(base64);
      if (analysisResult.error) {
        setError(analysisResult.error);
      } else {
        setResult(analysisResult);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  }, [base64]);

  return { imageUri, result, loading, error, pickImage, captureImage, analyzeImage };
}
