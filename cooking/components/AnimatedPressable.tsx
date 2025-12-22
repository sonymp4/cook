import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
}

export default function AnimatedPressable({ children, style, ...props }: AnimatedPressableProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.default,
        typeof style === 'function' ? style({ pressed }) : style,
        pressed && styles.pressed,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  default: {
    opacity: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});

