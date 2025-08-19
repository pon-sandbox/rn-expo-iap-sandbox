import Constants from "expo-constants";
import { useIAP } from "expo-iap";
import React, { useEffect, useMemo } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

export default function SimpleStore() {
  const isIOS = Platform.OS === "ios";

  const {
    connected,
    products,
    requestProducts,
    requestPurchase,
    currentPurchase,
    finishTransaction,
  } = useIAP();

  // Get bundle ID from app.json (iOS only)
  const bundleId = useMemo(() => {
    return Constants.expoConfig?.ios?.bundleIdentifier || 'com.anonymous.my-app';
  }, []);

  // Product ID from environment variable or use bundle ID to construct default
  const productIds = useMemo(() => {
    // Use environment variable if set, otherwise use bundle ID from app.json
    const productId = process.env.EXPO_PUBLIC_PRODUCT_ID || `${bundleId}.premium`;
    console.log("Bundle ID from app.json:", bundleId);
    console.log("Using Product ID:", productId);

    // Filter out any undefined values and ensure we always have at least one product ID
    return productId ? [productId] : ['com.anonymous.my-app.premium'];
  }, [bundleId]);

  useEffect(() => {
    if (!isIOS) return; // Skip IAP on non-iOS platforms

    console.log("IAP Connection Status:", connected);
    if (connected) {
      console.log("Requesting products with IDs:", productIds);
      requestProducts({ skus: productIds, type: "inapp" })
        .then(() => console.log("Product request sent"))
        .catch((error) => console.error("Error requesting products:", error));
    }
  }, [connected, productIds, requestProducts, isIOS]);

  useEffect(() => {
    console.log("Products received:", products);
    console.log("Number of products:", products.length);
    if (products.length > 0) {
      products.forEach((product) => {
        console.log("Product details:", {
          id: product.id,
          title: product.title,
          price: product.displayPrice,
        });
      });
    }
  }, [products]);

  useEffect(() => {
    if (currentPurchase) {
      const completePurchase = async () => {
        try {
          console.log("Purchase completed:", currentPurchase.id);
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
        } catch (error) {
          console.error("Failed to complete purchase:", error);
        }
      };
      completePurchase();
    }
  }, [currentPurchase, finishTransaction]);

  const handlePurchase = async (productId: string) => {
    if (!isIOS) return; // Only allow purchases on iOS

    try {
      await requestPurchase({
        request: {
          ios: {
            sku: productId,
          },
          android: {
            skus: [productId],
          },
        },
      });
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  // Show message for non-iOS platforms
  if (!isIOS) {
    return (
      <View style={styles.container}>
        <Text style={styles.noProductsText}>
          In-app purchases are only available on iOS
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Store: {connected ? "Connected ✅" : "Connecting..."}
      </Text>

      {products.length === 0 && connected && (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>No products available</Text>
          <Text style={styles.instructionsText}>To see products:</Text>
          <Text style={styles.instructionItem}>
            1. Sign in to your Apple ID (Settings → Sign in)
          </Text>
          <Text style={styles.instructionItem}>
            2. Create products in App Store Connect
          </Text>
          <Text style={styles.instructionItem}>
            3. Update productIds in SimpleStore.tsx
          </Text>
          <Text style={styles.instructionItem}>
            4. Bundle ID (from app.json): {bundleId}
          </Text>
          <Text style={styles.instructionItem}>
            5. Product ID: {productIds[0]}
          </Text>
        </View>
      )}

      {products.map((product) => (
        <View key={product.id} style={styles.product}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{product.displayPrice}</Text>
          <Button title="Buy Now" onPress={() => handlePurchase(product.id)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  status: { fontSize: 16, marginBottom: 20 },
  product: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, color: "#666", marginVertical: 5 },
  noProductsContainer: {
    padding: 20,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    marginTop: 10,
  },
  noProductsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#856404",
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#856404",
  },
  instructionItem: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 4,
    color: "#856404",
  },
});
