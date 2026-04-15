import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

interface AppProps {
  container: HTMLElement;
};

const App = ({ container }: AppProps) => {
  return (
    <MantineProvider getRootElement={() => container} defaultColorScheme="auto">
      <Notifications
        portalProps={{ target: container }}
        position="bottom-right"
      />
    </MantineProvider>
  );
};

export default App;
