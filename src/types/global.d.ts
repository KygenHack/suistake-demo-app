interface Window {
    Telegram: {
        WebApp: {
            openLink: (url: string) => void;
            MainButton: {
                setText: (text: string) => void;
                text: string;
                onClick: (callback: () => void) => void;
            };
        };
    };
} 