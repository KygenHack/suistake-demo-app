import { Page } from '@/components/Page';
import { Button, Text, Placeholder } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { AiOutlineHome, AiOutlineInfoCircle, AiOutlineCheckCircle } from 'react-icons/ai';
import { BiNetworkChart } from 'react-icons/bi';
import { RiMessage3Line } from 'react-icons/ri';
import { FaCoins, FaYoutube, FaTelegram, FaExternalLinkAlt, FaTwitter, FaArrowUp, FaArrowDown, FaBolt } from 'react-icons/fa';
import { initData, useSignal, User as TelegramUser, miniApp } from '@telegram-apps/sdk-react';
import { beginZkLogin, completeZkLogin, AccountData } from '@/services/suiZKLogin';

interface User extends TelegramUser {
  rank?: string;
  referrer?: {
    photoUrl?: string;
    username?: string;
    firstName: string;
    lastName?: string;
    isPremium?: boolean;
  };
}

const tabs = [
  { id: 'home', text: 'Home', Icon: AiOutlineHome },
  { id: 'network', text: 'Network', Icon: BiNetworkChart },
  { id: 'gmp', text: 'GMP', Icon: FaCoins },
  { id: 'support', text: 'Support', Icon: RiMessage3Line },
  { id: 'token', text: 'Token', Icon: FaCoins },
];

type RankType = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

const getRankColor = (rank: string): string => {
  const colors: Record<RankType | 'default', string> = {
    'Bronze': 'bg-amber-500/10 text-amber-400',
    'Silver': 'bg-gray-400/10 text-gray-300',
    'Gold': 'bg-yellow-500/10 text-yellow-400',
    'Platinum': 'bg-cyan-500/10 text-cyan-400',
    'Diamond': 'bg-blue-500/10 text-blue-400',
    'Master': 'bg-purple-500/10 text-purple-400',
    default: 'bg-white/10 text-gray-400'
  };
  return colors[rank as RankType] || colors.default;
};

const getRankTier = (rank: string): string => {
  const tiers: Record<RankType | 'default', string> = {
    'Bronze': 'Tier I',
    'Silver': 'Tier II',
    'Gold': 'Tier III',
    'Platinum': 'Tier IV',
    'Diamond': 'Tier V',
    'Master': 'Elite',
    'default': 'Tier I'
  };
  return tiers[rank as RankType] || tiers.default;
};

const formatRankProgress = (rank: string): string => {
  const progress: Record<RankType | 'default', string> = {
    'Bronze': '0/1,000 points',
    'Silver': '1,000/2,500 points',
    'Gold': '2,500/5,000 points',
    'Platinum': '5,000/10,000 points',
    'Diamond': '10,000/25,000 points',
    'Master': '25,000+ points',
    'default': '0 points'
  };
  return progress[rank as RankType] || progress.default;
};

export const IndexPage: FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [activeSection, setActiveSection] = useState('stats');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [tokenSection, setTokenSection] = useState('tokenomics');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  
  // Get Telegram user data
  const initDataState = useSignal(initData.state);
  const user = initDataState?.user as User | undefined;

  useEffect(() => {
    const initializeWallet = async () => {
        try {
            const setupData = await beginZkLogin('Google');
            console.log('setupData', setupData);

            // Listen for the JWT from the Telegram Mini App
            window.Telegram.WebApp.MainButton.onClick(async () => {
                const message = window.Telegram.WebApp.MainButton.text;
                if (message) {
                    const { jwt } = JSON.parse(message);
                    if (jwt) {
                        const account = await completeZkLogin(jwt, setupData);
                        setAccountData(account);
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing wallet:', error);
        }
    };

    initializeWallet();
}, []);

  // Helper function to render correct content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto p-custom">
            {/* Stake Card */}
            <div className="bg-[#1A1B1E] rounded-[24px] p-5">
              <Text className="text-[15px] text-white/80 mt-2 mb-2">
                My stake
              </Text>
              <br/>
              <div className="flex justify-between items-start">
                <div className="flex flex-col mt-4">
                  <Text className="text-[48px] font-extrabold text-white tracking-tight">$0</Text>
                  <Text className="text-[18px] font-medium text-white/60 mt-2">0 SUI</Text>
                </div>
                <Button
                  size="s"
                  className="bg-white text-black rounded-full px-4 py-2 text-[15px]"
                >
                  Deposit
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Text className="text-[13px] text-white/60">NET ROI</Text>
                <Text className="text-[13px] text-[#4BB543]">+1%</Text>
                <AiOutlineInfoCircle className="text-white/60 text-[13px]" />
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-[#1A1B1E] rounded-[24px] p-5">
              <div className="flex justify-between items-center mb-4">
                <Text className="text-gray-200">Earnings Available</Text>
                <Button
                  size="s"
                  className="bg-white text-black rounded-full px-6"
                >
                  Withdraw
                </Button>
              </div>
              <div className="flex flex-col">
                  <Text className="text-[48px] font-extrabold text-white tracking-tight">$0</Text>
                  <Text className="text-[18px] font-medium text-white/60 mt-2">0 SUI</Text>
                </div>
                
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <Text className="text-gray-400">Staking timeline</Text>
                  <AiOutlineInfoCircle className="text-gray-400" />
                </div>
                <div className="w-full h-1 bg-[#2a2a40] rounded-full mt-2">
                  <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Stats Navigation */}
            <div className="flex gap-4 mb-6">
              <Button
                size="s"
                className={`rounded-full px-6 py-2 ${
                  activeSection === 'stats' 
                    ? 'bg-[#0066FF] text-white' 
                    : 'bg-transparent text-gray-400'
                }`}
                onClick={() => setActiveSection('stats')}
              >
                Stats
              </Button>
              <Button
                size="s"
                className={`rounded-full px-6 py-2 ${
                  activeSection === 'community' 
                    ? 'bg-[#0066FF] text-white' 
                    : 'bg-transparent text-gray-400'
                }`}
                onClick={() => setActiveSection('community')}
              >
                Community
              </Button>
              <Button
                size="s"
                className={`rounded-full px-6 py-2 ${
                  activeSection === 'activity' 
                    ? 'bg-[#0066FF] text-white' 
                    : 'bg-transparent text-gray-400'
                }`}
                onClick={() => setActiveSection('activity')}
              >
                Activity
              </Button>
            </div>

            {/* Stats Content */}
            {activeSection === 'stats' && (
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="space-y-4">
                  {/* Total Team Volume */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <BiNetworkChart className="text-blue-400 text-xl" />
                      </div>
                      <Text className="text-gray-200">Total team volume</Text>
                    </div>
                    <Text className="text-white">$0</Text>
                  </div>

                  {/* Current Rank */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <FaCoins className="text-yellow-400 text-xl" />
                      </div>
                      <Text className="text-gray-200">Current rank</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text className="text-white">No rank</Text>
                      <span className="text-yellow-400">👑</span>
                    </div>
                  </div>

                  {/* Weekly Rank Bonus */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <FaCoins className="text-green-400 text-xl" />
                      </div>
                      <Text className="text-gray-200">Weekly Rank bonus</Text>
                    </div>
                    <div className="flex flex-col items-end">
                      <Text className="text-white">$0</Text>
                      <Text className="text-sm text-gray-400">0 SUI</Text>
                    </div>
                  </div>

                  {/* Total Referrals */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <RiMessage3Line className="text-purple-400 text-xl" />
                      </div>
                      <Text className="text-gray-200">Total referrals</Text>
                    </div>
                    <Text className="text-white">0</Text>
                  </div>

                  {/* Total Referral Bonus */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FaCoins className="text-blue-400 text-xl" />
                      </div>
                      <Text className="text-gray-200">Total referral bonus</Text>
                    </div>
                    <div className="flex flex-col items-end">
                      <Text className="text-white">$0</Text>
                      <Text className="text-sm text-gray-400">0 SUI</Text>
                    </div>
                  </div>

                  {/* Total Withdrawn */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <FaArrowUp className="text-red-400 text-xl" />
                      </div>
                      <Text className="text-gray-200">Total withdrawn</Text>
                    </div>
                    <div className="flex flex-col items-end">
                      <Text className="text-white">$0</Text>
                      <Text className="text-sm text-gray-400">0 SUI</Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'community' && (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {/* Social Links Card */}
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <Text className="text-lg font-semibold text-gray-200 mb-4">Social Links</Text>
                  
                  {/* YouTube */}
                  <div className="flex justify-between items-center group hover:bg-black/20 p-3 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
                        <FaYoutube className="text-white text-2xl" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <Text className="text-gray-200 font-medium truncate">
                          Official YouTube Channel
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="text-xs text-gray-400">Tutorials & Updates</Text>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">Live</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="s"
                      className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 backdrop-blur-sm transition-all whitespace-nowrap"
                    >
                      Join <FaExternalLinkAlt className="text-xs hidden sm:block" />
                    </Button>
                  </div>

                  {/* Telegram Channel */}
                  <div className="flex justify-between items-center group hover:bg-black/20 p-3 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00a0e6] flex items-center justify-center shadow-lg shadow-[#0088cc]/20 group-hover:scale-105 transition-transform">
                        <FaTelegram className="text-white text-2xl" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <Text className="text-gray-200 font-medium truncate">
                          Official Channel
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="text-xs text-gray-400">News & Announcements</Text>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#0088cc]/20 text-[#0088cc] rounded-full">Official</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="s"
                      className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 backdrop-blur-sm transition-all whitespace-nowrap"
                    >
                      Join <FaExternalLinkAlt className="text-xs hidden sm:block" />
                    </Button>
                  </div>

                  {/* Twitter/X */}
                  <div className="flex justify-between items-center group hover:bg-black/20 p-3 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-black border border-gray-700 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                        <FaTwitter className="text-white text-2xl" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <Text className="text-gray-200 font-medium truncate">
                          X (Twitter)
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="text-xs text-gray-400">Latest Updates</Text>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-white/10 text-gray-400 rounded-full">Social</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="s"
                      className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 backdrop-blur-sm transition-all whitespace-nowrap"
                    >
                      Join <FaExternalLinkAlt className="text-xs hidden sm:block" />
                    </Button>
                  </div>

                  {/* Telegram Chat */}
                  <div className="flex justify-between items-center group hover:bg-black/20 p-3 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00a0e6] flex items-center justify-center shadow-lg shadow-[#0088cc]/20 group-hover:scale-105 transition-transform">
                        <FaTelegram className="text-white text-2xl" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <Text className="text-gray-200 font-medium truncate">
                          Community Chat
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="text-xs text-gray-400">Community Discussion</Text>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#0088cc]/20 text-[#0088cc] rounded-full">Chat</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="s"
                      className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 backdrop-blur-sm transition-all whitespace-nowrap"
                    >
                      Join <FaExternalLinkAlt className="text-xs hidden sm:block" />
                    </Button>
                  </div>
                </div>

                {/* Stats Card - Can be added later */}
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 hidden md:block">
                  <Text className="text-lg font-semibold text-gray-200 mb-4">Community Stats</Text>
                  {/* Add community stats here */}
                </div>
              </div>
            )}

            {activeSection === 'activity' && (
              <div className="space-y-6">
                {/* Activity Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Total Deposits */}
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaArrowDown className="text-blue-500 text-lg" />
                      </div>
                      <Text className="text-gray-400 text-sm">Total Deposits</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-2xl font-bold text-white tabular-nums">0</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <Text className="text-xs text-gray-400">≈ $0.00</Text>
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                          0 SUI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Withdrawals */}
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 hover:shadow-lg hover:shadow-green-500/5 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaArrowUp className="text-green-500 text-lg" />
                      </div>
                      <Text className="text-gray-400 text-sm">Total Withdrawals</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-2xl font-bold text-white tabular-nums">0</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <Text className="text-xs text-gray-400">≈ $0.00</Text>
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                          0 SUI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 hover:shadow-lg hover:shadow-yellow-500/5 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BiNetworkChart className="text-yellow-500 text-lg" />
                      </div>
                      <Text className="text-gray-400 text-sm">Pending</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-2xl font-bold text-white tabular-nums">0</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <Text className="text-xs text-gray-400">Processing</Text>
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                          0 tx
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 hover:shadow-lg hover:shadow-purple-500/5 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AiOutlineCheckCircle className="text-purple-500 text-lg" />
                      </div>
                      <Text className="text-gray-400 text-sm">Completed</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-2xl font-bold text-white tabular-nums">0</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <Text className="text-xs text-gray-400">All time</Text>
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
                          0 tx
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <Text className="text-lg font-semibold text-gray-200">Recent Activity</Text>
                    <Button
                      size="s"
                      className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-4 py-2 text-sm"
                    >
                      View All
                    </Button>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-4">
                    {/* Empty State */}
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RiMessage3Line className="text-2xl text-gray-400" />
                      </div>
                      <Text className="text-gray-400 mb-2">No activity yet</Text>
                      <Text className="text-sm text-gray-500">
                        Your recent transactions will appear here
                      </Text>
                    </div> 
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Button
                    size="s"
                    className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-6 py-2 whitespace-nowrap"
                  >
                    All
                  </Button>
                  <Button
                    size="s"
                    className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-6 py-2 whitespace-nowrap"
                  >
                    Deposits
                  </Button>
                  <Button
                    size="s"
                    className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-6 py-2 whitespace-nowrap"
                  >
                    Withdrawals
                  </Button>
                  <Button
                    size="s"
                    className="bg-white/10 hover:bg-[#0066FF] text-white rounded-full px-6 py-2 whitespace-nowrap"
                  >
                    Rewards
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'network':
        return (
          <div className="flex-1 p-4 sm:p-6 space-y-6 p-custom">
            {/* Network Overview Card */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rank */}
                <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <FaCoins className="text-yellow-500 text-xl" />
                    </div>
                    <Text className="text-gray-400">Rank</Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-2xl sm:text-3xl font-bold text-white">
                      {user?.rank || 'Unranked'}
                    </Text>
                    {user?.rank && (
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        getRankColor(user.rank)
                      }`}>
                        {getRankTier(user.rank)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Text className="text-sm text-gray-400">Current position</Text>
                    {user?.rank && (
                      <Text className="text-xs text-gray-400">
                        • {formatRankProgress(user.rank)}
                      </Text>
                    )}
                  </div>
                </div>

                {/* Referred by */}
                <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <RiMessage3Line className="text-blue-500 text-xl group-hover:rotate-12 transition-transform" />
                    </div>
                    <Text className="text-gray-400">Referred by</Text>
                  </div>
                  {user?.referrer ? (
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.referrer.photoUrl || "https://xelene.me/telegram.gif"} 
                        alt="" 
                        className="w-8 h-8 rounded-full ring-2 ring-black/50"
                      />
                      <div className="flex flex-col">
                        <Text className="text-xl font-bold text-white">
                          @{user.referrer.username || 'Anonymous'}
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="text-sm text-gray-400">
                            {user.referrer.firstName} {user.referrer.lastName}
                          </Text>
                          {user.referrer.isPremium && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 text-yellow-500 rounded-full ring-1 ring-yellow-500/20">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Text className="text-2xl font-bold text-white">No upline</Text>
                      <br/>
                      <Text className="text-sm text-gray-400 mt-1">
                        Join through a referral link
                      </Text>
                    </>
                  )}
                </div>

                {/* Total Network */}
                <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <BiNetworkChart className="text-purple-500 text-xl" />
                    </div>
                    <Text className="text-gray-400">Total Network</Text>
                  </div>
                  <Text className="text-2xl font-bold text-white tabular-nums">0</Text>
                  <br/>
                  <Text className="text-sm text-gray-400 mt-1">Active members</Text>
                </div>

                {/* Total Team Volume */}
                <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <FaCoins className="text-green-500 text-xl" />
                    </div>
                    <Text className="text-gray-400">Total Team Volume</Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-2xl font-bold text-white tabular-nums">$0</Text>
                  </div>
                  <Text className="text-sm text-gray-400 mt-1">Combined stakes</Text>
                </div>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bonus Stats */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Paid Out */}
                  <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <FaCoins className="text-green-500 text-xl" />
                      </div>
                      <Text className="text-gray-400">Total paid out</Text>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Text className="text-2xl font-bold text-white tabular-nums">$0</Text>
                      <br/>
                      <Text className="text-sm text-gray-400">0 SUI</Text>
                    </div>
                    <Text className="text-sm text-gray-400 mt-1">Referral bonus</Text>
                  </div>

                  {/* Expected Rank Bonus */}
                  <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <FaCoins className="text-yellow-500 text-xl" />
                      </div>
                      <Text className="text-gray-400">Expected bonus</Text>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Text className="text-2xl font-bold text-white tabular-nums">$0</Text>
                      <br/>
                      <Text className="text-sm text-gray-400">0 SUI</Text>
                    </div>
                    <Text className="text-sm text-gray-400 mt-1">Rank bonus</Text>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-200">Your Referral Link</Text>
                  <Button
                    size="s"
                    className="bg-[#0066FF] text-white rounded-full px-4 py-2"
                  >
                    Copy
                  </Button>
                </div>
                <div className="bg-black/20 rounded-xl p-3 flex items-center gap-2 backdrop-blur-sm">
                  <Text className="text-gray-400 text-sm truncate flex-1">
                  https://t.me/SUI_Stake_It_Bot?start={user?.id || '0'}
                  </Text>
                  <Button
                    size="s"
                    className="bg-white/10 text-white rounded-full p-2"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </Button>
                </div>
                <Text className="text-sm text-gray-400 mt-3">
                  Share this link to earn rewards from referrals
                </Text>
              </div>
            </div>

            {/* Rank Progress */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <Text className="text-lg font-semibold text-gray-200">Rank Progress</Text>
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                  Current: No Rank
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* Simplified Referral Levels Card */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <Text className="text-lg font-semibold text-gray-200">Referral Levels</Text>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        level === selectedLevel
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Referrals List */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 px-4">
                  <div>User</div>
                  <div>Stake</div>
                  <div>Reward</div>
                </div>

                {/* Empty State */}
                <div className="text-center py-8 bg-black/20 rounded-xl">
                  <Text className="text-gray-400">
                    No Level {selectedLevel} referrals
                  </Text>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <Text className="text-gray-400 text-sm">Level {selectedLevel} Referrals</Text>
                  <br/>
                  <Text className="text-xl font-bold text-white mt-1">0</Text>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                  <Text className="text-gray-400 text-sm">Total Rewards</Text>
                  <br/>
                  <Text className="text-xl font-bold text-white mt-1">0 SUI</Text>
                </div>
              </div>
            </div>
          </div>
        );
      case 'gmp':
        return (
          <div className="flex-1 p-4 sm:p-6 space-y-6">
            {/* Global Matrix Pool Card */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <Text className="text-gray-200 mb-4">Global Matrix Pool</Text>
              <div className="space-y-2">
                <Text className="text-4xl font-bold">$0</Text>
                <div className="flex items-center gap-2">
                  <Text className="text-gray-400">0 SUI</Text>
                </div>
              </div>
            </div>

            {/* Reward Card */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FaCoins className="text-blue-500 text-sm" />
                </div>
                <div className="flex flex-col">
                  <Text className="text-gray-200">Reward</Text>
                  <Text className="text-xl font-bold">$0</Text>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Position Card */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <FaArrowUp className="text-yellow-500 text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-gray-200">Position</Text>
                    <Text className="text-xl font-bold">-</Text>
                  </div>
                </div>
              </div>

              {/* Shares Card */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <BiNetworkChart className="text-purple-500 text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-gray-200">Shares</Text>
                    <Text className="text-xl font-bold">0</Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <Text className="text-lg font-semibold text-gray-200 mb-6">Global Leaderboard</Text>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-gray-400">
                      <th className="text-left pb-4">POS</th>
                      <th className="text-left pb-4">User</th>
                      <th className="text-left pb-4">Pool share</th>
                      <th className="text-right pb-4">Expected reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {/* No Data Message */}
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        No data
                      </td>
                    </tr>
                   
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="flex-1 p-4 sm:p-6 space-y-6">
            {/* Support Ticket Form */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="space-y-6">
                {/* Ticket Type */}
                <div className="space-y-2">
                  <Text className="text-gray-200">Ticket Type</Text>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-gray-200 appearance-none cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a ticket type</option>
                      <option value="deposit">Deposit Issue</option>
                      <option value="withdrawal">Withdrawal Issue</option>
                      <option value="rewards">Rewards Issue</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <Text className="text-sm text-gray-400">
                    Choose the category that best describes your issue.
                  </Text>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Text className="text-gray-200">Description</Text>
                  <textarea
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-gray-200 min-h-[120px] resize-none"
                    placeholder="Please describe your issue in detail..."
                  />
                  <Text className="text-sm text-gray-400">
                    For related type(s) include your transaction hash and wallet address you deposited or withdrew
                  </Text>
                </div>

                {/* Submit Button */}
                <button className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl px-4 py-3 font-medium transition-colors">
                  Submit Ticket
                </button>
              </div>
            </div>

            {/* Direct Message Button */}
            <button className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2">
              <span>Invite friends</span>
            </button>

            {/* Ticket History */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <Text className="text-lg font-semibold text-gray-200 mb-6">Ticket History</Text>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-gray-400">
                      <th className="text-left pb-4">Reg no.</th>
                      <th className="text-left pb-4">Type</th>
                      <th className="text-left pb-4">Created</th>
                      <th className="text-right pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {/* No Tickets Message */}
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        Ticket History
                      </td>
                    </tr>
                    
                   
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'token':
        return (
          <div className="flex-1 p-4 sm:p-6 space-y-6 p-custom">
            {/* Token Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
              {/* Bison Token Card */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="space-y-2">
                  <Text className="text-4xl font-bold text-white">
                    Sui Stake Token
                  </Text>
                  <br/>
                  <Text className="text-gray-400">
                    $2M Goal To Launch
                  </Text>
                </div>
              </div>

              {/* Your Token Balance Card */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="space-y-2">
                  <Text className="text-gray-400">Your Sui Stake Token</Text>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-4xl font-bold text-white">0</Text>
                    <Text className="text-blue-500">$SST</Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f31] rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setTokenSection('tokenomics')}
                  className={`px-6 py-2 rounded-full text-sm font-medium ${
                    tokenSection === 'tokenomics' 
                      ? 'bg-[#0066FF] text-white' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Tokenomics
                </button>
                <button 
                  onClick={() => setTokenSection('products')}
                  className={`px-6 py-2 rounded-full text-sm font-medium ${
                    tokenSection === 'products' 
                      ? 'bg-[#0066FF] text-white' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Products
                </button>
              </div>

              {tokenSection === 'tokenomics' ? (
                <div className="space-y-6">
                  {/* Total Supply */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <FaBolt className="text-blue-500 text-xl" />
                      </div>
                      <Text className="text-gray-200">Total Supply</Text>
                    </div>
                    <Text className="text-gray-200">100M</Text>
                  </div>

                  {/* Community */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <BiNetworkChart className="text-purple-500 text-xl" />
                      </div>
                      <Text className="text-gray-200">Community</Text>
                    </div>
                    <Text className="text-gray-200">65%</Text>
                  </div>

                  {/* Listing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <FaCoins className="text-yellow-500 text-xl" />
                      </div>
                      <Text className="text-gray-200">Listing</Text>
                    </div>
                    <Text className="text-gray-200">20%</Text>
                  </div>

                  {/* Dev */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <FaBolt className="text-green-500 text-xl" />
                      </div>
                      <Text className="text-gray-200">Dev</Text>
                    </div>
                    <Text className="text-gray-200">5%</Text>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <FaCoins className="text-red-500 text-xl" />
                      </div>
                      <Text className="text-gray-200">Marketing</Text>
                    </div>
                    <Text className="text-gray-200">10%</Text>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 ">
                  {/* Staking Platform */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FaCoins className="text-blue-400 text-xl" />
                      </div>
                      <div>
                        <Text className="text-gray-200">Staking Platform</Text>
                        <br/>
                        <Text className="text-sm text-gray-400">Earn rewards with SUI</Text>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      Live
                    </span>
                  </div>

                  {/* Token */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <FaBolt className="text-purple-400 text-xl" />
                      </div>
                      <div>
                        <Text className="text-gray-200">Bison Token</Text>
                        <br/>
                        <Text className="text-sm text-gray-400">Governance & Utility</Text>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                      Coming Soon
                    </span>
                  </div>

                  {/* Mobile App */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <FaBolt className="text-green-400 text-xl" />
                      </div>
                      <div>
                        <Text className="text-gray-200">Mobile App</Text>
                        <br/>
                        <Text className="text-sm text-gray-400">Stake on the go</Text>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                      Q3 2024
                    </span>
                  </div>

                  {/* DAO */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <BiNetworkChart className="text-yellow-400 text-xl" />
                      </div>
                      <div>
                        <Text className="text-gray-200">DAO Governance</Text>
                        <br/>
                        <Text className="text-sm text-gray-400">Community-driven</Text>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                      Q4 2024
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      // Add other tab contents as needed
      default:
        return (
          <div className="flex-1 p-4 sm:p-6 flex items-center justify-center">
            <Text className="text-gray-400">Coming soon</Text>
          </div>
        );
    }
  };

  if (!initDataState) {
    return (
      <Page>
        <Placeholder
          header="Loading..."
          description="Initializing application data"
        >
          <img
            alt="Loading"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex flex-col min-h-screen bg-black max-w-7xl mx-auto">
        {/* Header - Enhanced user profile section */}
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-lg z-50 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <img 
                  src={user?.photoUrl || "https://xelene.me/telegram.gif"} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-black"
                />
                {user?.isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ring-2 ring-black">
                    <span className="text-xs">⭐️</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Text className="font-semibold text-white">
                  @{user?.username || 'Anonymous'}
                </Text>
                {user?.isPremium && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 text-yellow-500 rounded-full ring-1 ring-yellow-500/20">
                    Premium
                  </span>
                )}
              </div>
              <Text className="text-sm text-gray-400">
                {user?.firstName || 'Anonymous'} {user?.lastName || ''}
              </Text>
            </div>
          </div>
          
          <Button 
            size="s"
            className="bg-gradient-to-r from-[#0066FF] to-blue-700 hover:from-[#0052cc] hover:to-blue-800 text-white rounded-full px-6 py-2.5 font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <span>Invite friends</span>
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden pb-[72px]">
          {renderTabContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1A1B1E]/80 backdrop-blur-lg border-t border-white/5 px-2 py-1 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              {tabs.map(({ id, text, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentTab(id);
                    if (id === 'home') {
                      setActiveSection('stats');
                    }
                  }}
                  className={`flex flex-col items-center py-3 px-5 rounded-xl transition-all duration-200 ${
                    currentTab === id
                      ? 'text-[#0066FF] bg-[#0066FF]/10'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon 
                    size={20} 
                    className={`${
                      currentTab === id
                        ? 'transform scale-110 transition-transform duration-200'
                        : ''
                    }`}
                  />
                  <span className="text-xs mt-1 font-medium">{text}</span>
                  
                  {/* Active Indicator */}
                  {currentTab === id && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0066FF]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default IndexPage;
