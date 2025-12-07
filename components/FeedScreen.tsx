import React from 'react';

const FeedItem = ({ date, title, stats, imageId }: { date: string, title: string, stats: string, imageId: number }) => (
  <div className="bg-white p-4 mb-2 shadow-sm flex justify-between items-start">
    <div className="flex-1 pr-4">
      <div className="text-gray-400 text-xs mb-1">{date}</div>
      <div className="text-gray-800 text-base font-medium leading-snug mb-2">
        {title}
      </div>
      <div className="text-gray-400 text-xs">
        {stats}
      </div>
    </div>
    <div className="w-20 h-20 flex-shrink-0">
      <img 
        src={`https://picsum.photos/id/${imageId}/200/200`} 
        alt="Thumbnail" 
        className="w-full h-full object-cover rounded-md"
      />
    </div>
  </div>
);

const FeedScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto no-scrollbar pb-20">
      <FeedItem 
        date="1月26日" 
        title="马蜂来袭？！不怕，我们会出手" 
        stats="阅读 67" 
        imageId={10} 
      />
      <FeedItem 
        date="1月24日" 
        title="秉承助人精神—全心全意为人民服务" 
        stats="阅读 57 赞 1" 
        imageId={12} 
      />
      <FeedItem 
        date="1月22日" 
        title="惊！大学生古道迷路 | 团结协作，成功搜救！" 
        stats="阅读 205 赞 4" 
        imageId={16} 
      />
      <FeedItem 
        date="1月20日" 
        title="【切身体会】志愿者参与森林消防体能拉练活动" 
        stats="阅读 9" 
        imageId={28} 
      />
       <FeedItem 
        date="1月18日" 
        title="夜间突发情况演练：迅速集结，保障安全" 
        stats="阅读 112 赞 8" 
        imageId={54} 
      />
    </div>
  );
};

export default FeedScreen;