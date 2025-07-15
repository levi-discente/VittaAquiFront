import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null; info: ErrorInfo | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, info: null };

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('💥 ErrorBoundary caught:', error, info.componentStack);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Ocorreu um erro inesperado:</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Text style={styles.stack}>{this.state.info?.componentStack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#900',
  },
  message: {
    marginBottom: 12,
    color: '#333',
  },
  stack: {
    fontSize: 12,
    color: '#555',
  },
});
