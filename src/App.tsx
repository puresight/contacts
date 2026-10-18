import { AppShell } from '@/components/AppShell';
import { ThemeProvider } from '@/context/ThemeContext';
import { TextSizeProvider } from '@/context/TextSizeContext';
import { InstallPromptProvider } from '@/context/InstallPromptContext';

export default function App() {
  return (
    <ThemeProvider>
      <TextSizeProvider>
        <InstallPromptProvider>
          <AppShell />
        </InstallPromptProvider>
      </TextSizeProvider>
    </ThemeProvider>
  );
}
