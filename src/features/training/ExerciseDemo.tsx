import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

type Props = { videoId: string; title: string };

export function ExerciseDemo({ videoId, title }: Props) {
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#09060d}iframe{width:100%;height:100%;border:0}</style></head><body><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0" title="${title.replace(/["<>]/g, '')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></body></html>`;
  return <View style={styles.frame}><WebView source={{ html, baseUrl: 'https://fitai-4unn.onrender.com' }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction javaScriptEnabled domStorageEnabled style={styles.webview} /></View>;
}
const styles = StyleSheet.create({ frame: { width: '100%', aspectRatio: 9 / 16, maxHeight: 520, backgroundColor: '#09060d', borderRadius: 16, overflow: 'hidden', marginTop: 12 }, webview: { flex: 1, backgroundColor: '#09060d' } });
