import { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, BackHandler, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';

const SITE_URL = 'https://planopace.vercel.app';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button — navigate back in WebView instead of closing app
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [canGoBack]);

  // Handle deep links — navigate WebView to the linked path
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path } = Linking.parse(event.url);
      if (path && webViewRef.current) {
        webViewRef.current.injectJavaScript(
          `window.location.href = '${SITE_URL}/${path}'; true;`
        );
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        const { path } = Linking.parse(url);
        if (path && webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.location.href = '${SITE_URL}/${path}'; true;`
          );
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // Inject CSS to hide elements that don't make sense in the app
  const injectedJS = `
    (function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

      var style = document.createElement('style');
      style.textContent = '[data-hide-in-app], .download-app-banner { display: none !important; } body { background-color: #0A0A0B; }';
      document.head.appendChild(style);
    })();
    true;
  `;

  const handleShouldStartLoad = useCallback((event: { url: string }) => {
    const { url } = event;

    // Allow navigation within the site
    if (url.startsWith(SITE_URL)) return true;

    // Allow OAuth callbacks and auth flows
    if (
      url.includes('accounts.google.com') ||
      url.includes('strava.com/oauth') ||
      url.includes('api.strava.com')
    ) {
      return true;
    }

    // Open external links in the system browser
    Linking.openURL(url);
    return false;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        injectedJavaScript={injectedJS}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        pullToRefreshEnabled
        decelerationRate="normal"
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.logo}>
              PLANO<Text style={styles.accent}>PACE</Text>
            </Text>
            <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 24 }} />
          </View>
        )}
      />
      {loading && (
        <View style={styles.splash}>
          <Text style={styles.logo}>
            PLANO<Text style={styles.accent}>PACE</Text>
          </Text>
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 24 }} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  accent: {
    color: '#F97316',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
  },
});
