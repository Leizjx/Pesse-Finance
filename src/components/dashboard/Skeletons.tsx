import React from 'react';

export const CardSkeleton = () => (
  <div className="neumorphic p-6 lg:p-7 rounded-large w-full h-48 animate-pulse flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-black/10 rounded w-1/3"></div>
      <div className="w-10 h-10 bg-black/10 rounded-full"></div>
    </div>
    <div className="h-10 bg-black/10 rounded w-2/3 mt-2"></div>
    <div className="flex-1"></div>
    <div className="h-2 bg-black/10 rounded w-full"></div>
  </div>
);

export const ModalSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
    <div className="neumorphic w-full max-w-md p-8 rounded-[40px] relative z-10 animate-pulse">
      <div className="h-8 bg-black/10 rounded w-1/2 mb-8"></div>
      <div className="space-y-4">
        <div className="h-12 bg-black/10 rounded-2xl w-full"></div>
        <div className="h-12 bg-black/10 rounded-2xl w-full"></div>
        <div className="h-12 bg-black/10 rounded-2xl w-full"></div>
      </div>
      <div className="h-14 bg-black/10 rounded-full w-full mt-10"></div>
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="neumorphic p-6 lg:p-7 rounded-large w-full h-[300px] animate-pulse flex flex-col gap-6">
    <div className="h-6 bg-black/10 rounded w-1/4 mb-2"></div>
    <div className="flex-1 flex items-end justify-between gap-4 px-2">
      <div className="w-full bg-black/5 rounded-t-xl h-[40%]"></div>
      <div className="w-full bg-black/5 rounded-t-xl h-[70%]"></div>
      <div className="w-full bg-black/5 rounded-t-xl h-[50%]"></div>
      <div className="w-full bg-black/5 rounded-t-xl h-[90%]"></div>
      <div className="w-full bg-black/5 rounded-t-xl h-[60%]"></div>
    </div>
    <div className="h-4 bg-black/10 rounded w-1/2 mx-auto"></div>
  </div>
);
