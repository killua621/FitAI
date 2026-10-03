import { createElement } from 'react';
import { View, StyleSheet } from 'react-native';

type Props = { videoId: string; title: string };

export function ExerciseDemo({ videoId, title }: Props) {
  return <View style={styles.frame}>{createElement('iframe', { src: `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0`, title, allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share', allowFullScreen: true, loading: 'lazy', referrerPolicy: 'strict-origin-when-cross-origin', style: { width: '100%', height: '100%', border: 0 } })}</View>;
}
const styles = StyleSheet.create({ frame: { width: '100%', aspectRatio: 9 / 16, maxHeight: 520, backgroundColor: '#09060d', borderRadius: 16, overflow: 'hidden', marginTop: 12 } });
