import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { useProducts } from '../../contexts/products/ProductsContext';
import ScanResultModal from '../../components/modals/ScanResultModal';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const TensorCamera = cameraWithTensors(Camera);

enum ScanMode {
  BARCODE = 'barcode',
  OBJECT = 'object'
}

const ScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>(ScanMode.BARCODE);
  const [scanned, setScanned] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation();
  
  const { 
    scanProduct, 
    getAlternativesForProduct,
    isLoading,
    error
  } = useProducts();
  
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  useEffect(() => {
    if (scanMode === ScanMode.OBJECT) {
      initTensorFlow();
    }
  }, [scanMode]);
  
  const initTensorFlow = async () => {
    try {
      await tf.ready();
      setModelReady(true);
    } catch (error) {
      console.error('TensorFlow initialization error:', error);
      Alert.alert('Error', 'Failed to initialize object recognition. Please try barcode scanning instead.');
      setScanMode(ScanMode.BARCODE);
    }
  };
  
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    const product = await scanProduct(data);
    
    if (product) {
      setScannedProduct(product);
      setShowModal(true);
    } else if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    } else {
      Alert.alert('Product Not Found', 'This product was not found in our database.', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };
  
  const handleObjectDetection = async () => {
    Alert.alert('Coming Soon', 'Object recognition is not yet implemented.', [
      { text: 'OK' }
    ]);
  };
  
  const handleViewAlternatives = async () => {
    if (!scannedProduct) return;
    
    setShowModal(false);
    
    const alternatives = await getAlternativesForProduct(scannedProduct.id);
    
    if (alternatives.length > 0) {
      Alert.alert('Alternatives', `Found ${alternatives.length} eco-friendly alternatives.`);
    } else {
      Alert.alert('No Alternatives', 'No eco-friendly alternatives found for this product.');
    }
    
    setScanned(false);
  };
  
  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {scanMode === ScanMode.BARCODE ? (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean13, BarCodeScanner.Constants.BarCodeType.ean8],
            }}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        ) : (
          modelReady ? (
            <TensorCamera
              style={StyleSheet.absoluteFillObject}
              type={Camera.Constants.Type.back}
              cameraTextureHeight={1920}
              cameraTextureWidth={1080}
              resizeHeight={224}
              resizeWidth={224}
              resizeDepth={3}
              onReady={(images) => {
              }}
              autorender={true}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading Object Recognition...</Text>
            </View>
          )
        )}
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={styles.scanModeContainer}>
          <TouchableOpacity 
            style={[
              styles.scanModeButton, 
              scanMode === ScanMode.BARCODE && styles.activeScanMode
            ]}
            onPress={() => setScanMode(ScanMode.BARCODE)}
          >
            <Text style={styles.scanModeText}>Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.scanModeButton, 
              scanMode === ScanMode.OBJECT && styles.activeScanMode
            ]}
            onPress={() => setScanMode(ScanMode.OBJECT)}
          >
            <Text style={styles.scanModeText}>Object</Text>
          </TouchableOpacity>
        </View>
        
        {scanMode === ScanMode.BARCODE ? (
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={() => !scanned && handleBarCodeScanned({ type: 'manual', data: '3057640100604' })}
            disabled={scanned || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={handleObjectDetection}
            disabled={!modelReady}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        )}
        
        <Text style={styles.instructionText}>
          {scanMode === ScanMode.BARCODE 
            ? 'Point camera at a product barcode to scan' 
            : 'Point camera at a grocery product to analyze'}
        </Text>
      </View>
      
      <ScanResultModal
        visible={showModal}
        product={scannedProduct}
        onClose={() => {
          setShowModal(false);
          setScanned(false);
        }}
        onViewAlternatives={handleViewAlternatives}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  cameraPlaceholder: {
    color: 'white',
    fontSize: 18,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  scanModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  scanModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeScanMode: {
    backgroundColor: '#4CAF50',
  },
  scanModeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  instructionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ScannerScreen;
