const DEFAULT_PRICES = {
    vrtl: { buy: 89500000, sell: 90800000 },
    nhan: { buy: 88400000, sell: 89800000 },
    sjc: { buy: 90000000, sell: 91300000 },
};

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="settings-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const App = () => {
    const [prices, setPrices] = React.useState(DEFAULT_PRICES);
    const [lastUpdated, setLastUpdated] = React.useState(Date.now());
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const docRef = window.db ? window.db.collection('gold_prices').doc('current') : null;

    React.useEffect(() => {
        // If Firebase is configured, listen to real-time changes
        if (docRef) {
            const unsubscribe = docRef.onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        setPrices(data.prices);
                        setLastUpdated(data.lastUpdated);
                    } else {
                        // Initialize if not exists
                        docRef.set({
                            prices: DEFAULT_PRICES,
                            lastUpdated: Date.now()
                        });
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error("Firestore error", error);
                    setLoading(false);
                }
            );
            return () => unsubscribe();
        } else {
            // Fallback: LocalStorage mock for testing across tabs
            const stored = localStorage.getItem('mockGoldPrices');
            if (stored) {
                const parsed = JSON.parse(stored);
                setPrices(parsed.prices);
                setLastUpdated(parsed.lastUpdated);
            }
            setLoading(false);

            const handleStorageChange = (e) => {
                if (e.key === 'mockGoldPrices' && e.newValue) {
                    const parsed = JSON.parse(e.newValue);
                    setPrices(parsed.prices);
                    setLastUpdated(parsed.lastUpdated);
                }
            };
            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const handleSavePrices = async (newPrices) => {
        const timestamp = Date.now();
        if (docRef) {
            await docRef.set({
                prices: newPrices,
                lastUpdated: timestamp
            });
        } else {
            // LocalStorage fallback
            const payload = { prices: newPrices, lastUpdated: timestamp };
            localStorage.setItem('mockGoldPrices', JSON.stringify(payload));
            setPrices(newPrices);
            setLastUpdated(timestamp);
        }
    };

    const formatLastUpdated = (timestamp) => {
        const date = new Date(timestamp);
        const options = {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        const formatted = new Intl.DateTimeFormat('vi-VN', options).formatToParts(date);
        const parts = {};
        formatted.forEach(({ type, value }) => {
            parts[type] = value;
        });
        // Construct: HH:mm:ss DD/MM/YYYY
        return `${parts.hour}:${parts.minute}:${parts.second} ${parts.day}/${parts.month}/${parts.year}`;
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>Đang tải dữ liệu...</div>;
    }

    return (
        <React.Fragment>
            <header className="header">
                <div className="store-title">VÀNG BẠC ĐÁ QUÝ</div>
                <LiveClock />
                <button 
                    className="settings-btn" 
                    onClick={() => setIsSettingsOpen(true)}
                    title="Cài đặt"
                >
                    <SettingsIcon />
                </button>
            </header>

            <main className="main-content">
                <GoldPriceDisplay prices={prices} />
            </main>

            <footer className="footer">
                Giá vàng cập nhật lúc {formatLastUpdated(lastUpdated)}
            </footer>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
                <PriceEditor 
                    prices={prices} 
                    onSave={handleSavePrices} 
                    onCancel={() => setIsSettingsOpen(false)} 
                />
            </SettingsModal>
        </React.Fragment>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
