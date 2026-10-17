import { AppShell } from '@/components/AppShell';
import { ThemeProvider } from '@/context/ThemeContext';
import { TextSizeProvider } from '@/context/TextSizeContext';

export default function App() {
  return (
    <ThemeProvider>
      <TextSizeProvider>
        <AppShell />
      </TextSizeProvider>
    </ThemeProvider>
  );
}
