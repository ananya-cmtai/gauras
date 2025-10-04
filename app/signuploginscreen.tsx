// import { useGoogleLogin } from '@/components/socialAuthentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

const CAROUSEL_IMAGES = [
  "https://www.shutterstock.com/image-photo/dairy-products-bottles-milk-cottage-600nw-2483159649.jpg",
  "https://thumbs.dreamstime.com/b/dairy-products-milk-bottle-various-cheeses-bread-slices-wood-table-cow-stands-background-green-field-blue-sky-organic-farm-384802379.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/DairyProductsGermany.jpg/1200px-DairyProductsGermany.jpg",
];

export default function SignupLoginScreen() {
  const router = useRouter();
  // const { googleLogin } = useGoogleLogin();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // New state to track if input is focused
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Carousel active index for dots
  const [carouselIndex, setCarouselIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);




  // useEffect(() => {
  //   const checkToken = async () => {
  //     const token = await AsyncStorage.getItem('userToken');
  //     if (token) {
  //       router.replace('/');
  //     }
  //   };
  //   checkToken();
  // }, []);

  // Auto scroll carousel every 3 sec if not focused on input
  useEffect(() => {
    if (!isInputFocused) {
      carouselTimer.current = setInterval(() => {
        setCarouselIndex(prev => {
          let nextIndex = prev + 1;
          if (nextIndex >= CAROUSEL_IMAGES.length) nextIndex = 0;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, 3000);
    }

    return () => {
      if (carouselTimer.current) clearInterval(carouselTimer.current);
    };
  }, [isInputFocused]);



  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

const handleSendOTP = async () => {
  if (!emailOrPhone.trim()) {
    alert('Please enter email or phone');
    return;
  }

  setIsSendingOtp(true);
  try {
    const response = await fetch('https://gauras-backened.vercel.app/api/users/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrPhone }),
    });

    const data = await response.json();

    if (response.ok) {
      setStep('otp');
    } else {
      alert(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    alert('Error sending OTP');
  }
  setIsSendingOtp(false);
};

const handleVerifyOTP = async () => {
  const code = otp.join('');
  if (code.length < 6) {
    alert('Enter full 6 digit code');
    return;
  }

  setIsVerifyingOtp(true);
  try {
    const response = await fetch('https://gauras-backened.vercel.app/api/users/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrPhone, otp: code }),
    });

    const data = await response.json();
    // console.log("Login successfully:", data);

    if (response.ok) {
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userEmail', data.user.email);
        await AsyncStorage.setItem('userId', data.user._id);
          if(data.user.name){
    await AsyncStorage.setItem('currentUserName',data.user.name);
        }
  if(data.user.email){
     await AsyncStorage.setItem('currentUserEmail',data.user.email);
  }
    if(data.user.phone){
     await AsyncStorage.setItem('currentUserPhone',data.user.phone);
    }
      router.replace('/');
    } else {
      alert(data.message || 'Invalid OTP');
    }
  } catch (error) {
    alert('Error verifying OTP');
  }
  setIsVerifyingOtp(false);
};

  // const handleGooglelogin = async()=>{
  //       const response = await googleLogin(); // Replace with your Google login function
  //       console.log(response.data)

  // }

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCarouselIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Show carousel only when input NOT focused */}
          {!isInputFocused && (
            <>
              <FlatList
                ref={flatListRef}
                data={CAROUSEL_IMAGES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item  || 'https://static.toiimg.com/photo/113458714.cms'}} style={styles.carouselImage} />
                )}
                style={styles.carousel}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
              />

              {/* Dots Indicator */}
              <View style={styles.dotsContainer}>
                {CAROUSEL_IMAGES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === carouselIndex ? styles.activeDot : {},
                    ]}
                  />
                ))}
              </View>
            </>
          )}

          <View style={[styles.formContainer, isInputFocused && { flex: 1, justifyContent: 'flex-start', marginTop: 20 }]}>
            {step === 'input' ? (
              <>
                <Text style={styles.title}>Welcome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email or Phone"
                  keyboardType="email-address"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  returnKeyType="done"
                   onFocus={() => setIsInputFocused(true)}
  onBlur={() => setIsInputFocused(false)}
                  autoFocus={false}
                />
             <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={isSendingOtp}>
  {isSendingOtp ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.buttonText}>Continue</Text>
  )}
</TouchableOpacity>
      {/* <TouchableOpacity style={styles.button} onPress={handleGooglelogin} disabled={isSendingOtp}>
  {isSendingOtp ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.buttonText}>Continue with Google</Text>
  )}
</TouchableOpacity> */}

              </>
            ) : (
              <>
                <Text style={styles.title}>Enter OTP</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, idx) => (
                    <TextInput
                      key={idx}
                    ref={(ref) => {
  inputRefs.current[idx] = ref;
}}

                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOTPChange(idx, val)}
                      returnKeyType={idx === 5 ? 'done' : 'next'}
                     onFocus={() => setIsInputFocused(true)}
  onBlur={() => setIsInputFocused(false)}
                      onSubmitEditing={() => {
                        if (idx < inputRefs.current.length - 1) {
                          inputRefs.current[idx + 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

            <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={isVerifyingOtp}>
  {isVerifyingOtp ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.buttonText}>Verify OTP</Text>
  )}
</TouchableOpacity>


                <View style={styles.otpActions}>
                  <TouchableOpacity onPress={() => setStep('input')}>
                    <Text style={styles.actionText}>Change Email / Number</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleSendOTP}>
                    <Text style={[styles.actionText, { color: '#0b380e', fontWeight: '600' }]}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carousel: {
    height: height * 0.5, // 70% of screen height
  },
  carouselImage: {
    width: width,
    height: height * 0.5,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#0b380e',
    width: 12,
    height: 12,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b380e',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0b380e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
  },
});