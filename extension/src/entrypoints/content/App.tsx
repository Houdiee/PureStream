import { Toast } from "@base-ui/react";
import { toastManager } from "../../toast";
import { ToastViewport } from "../../components/Toast";

interface AppProps {
  container: HTMLElement;
};

const App = ({ container }: AppProps) => {
  return (
    <Toast.Provider toastManager={toastManager}>
      <Toast.Portal container={container}>
        <ToastViewport />
      </Toast.Portal>
    </Toast.Provider>
  );
};

export default App;
