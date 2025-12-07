import React, { useState } from 'react';
import { Home, MessageSquare, Compass, Triangle, Square, Circle, Plus, User } from 'lucide-react';
import ChatScreen from './components/ChatScreen';
import FeedScreen from './components/FeedScreen';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center font-sans">
      {/* Mobile Device Container */}
      <div className="w-full h-full max-w-md bg-white shadow-2xl relative flex flex-col overflow-hidden sm:rounded-3xl sm:h-[90vh] sm:border-[8px] sm:border-gray-900 box-border">
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            {activeTab === Tab.FEED && <FeedScreen />}
            {activeTab === Tab.CHAT && <ChatScreen />}
            {activeTab === Tab.PROFILE && (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
                发现 (Discover) Placeholder
                </div>
            )}
            {activeTab === Tab.CONTACTS && (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
                联系人 (Contacts) Placeholder
                </div>
            )}
          </div>

          {/* Tab Navigation (App Level) */}
          <nav className="bg-[#f7f7f7] border-t border-gray-300 h-14 grid grid-cols-5 items-center shrink-0 z-20 pb-1">
            <button 
              onClick={() => setActiveTab(Tab.FEED)}
              className={`flex flex-col items-center justify-center w-full h-full ${activeTab === Tab.FEED ? 'text-[#3b5998]' : 'text-gray-500'}`}
            >
              <Home className="w-6 h-6 mb-0.5" />
              <span className="text-[10px] font-medium scale-90">首页</span>
            </button>
            
            <button 
              onClick={() => setActiveTab(Tab.CHAT)}
              className={`flex flex-col items-center justify-center w-full h-full relative ${activeTab === Tab.CHAT ? 'text-[#3b5998]' : 'text-gray-500'}`}
            >
              <div className="relative">
                <MessageSquare className="w-6 h-6 mb-0.5" />
                {/* Notification Dot */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-[10px] font-medium scale-90">消息</span>
            </button>

            {/* Central Plus Button */}
            <div className="flex items-center justify-center w-full h-full -mt-4">
               <div className="w-12 h-12 bg-[#3b5998] rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 text-white" />
               </div>
            </div>

            <button 
              onClick={() => setActiveTab(Tab.PROFILE)} 
              className={`flex flex-col items-center justify-center w-full h-full ${activeTab === Tab.PROFILE ? 'text-[#3b5998]' : 'text-gray-500'}`}
            >
              <Compass className="w-6 h-6 mb-0.5" />
              <span className="text-[10px] font-medium scale-90">发现</span>
            </button>

            <button 
              onClick={() => setActiveTab(Tab.CONTACTS)} 
              className={`flex flex-col items-center justify-center w-full h-full ${activeTab === Tab.CONTACTS ? 'text-[#3b5998]' : 'text-gray-500'}`}
            >
              <User className="w-6 h-6 mb-0.5" />
              <span className="text-[10px] font-medium scale-90">联系人</span>
            </button>
          </nav>
        </div>

        {/* Virtual Android Navigation Keys */}
        <div className="h-10 bg-black flex items-center justify-around px-12 shrink-0">
            <Triangle className="w-5 h-5 text-gray-400 -rotate-90 fill-gray-400" />
            <Circle className="w-4 h-4 text-gray-400 stroke-[3]" />
            <Square className="w-4 h-4 text-gray-400 fill-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default App;