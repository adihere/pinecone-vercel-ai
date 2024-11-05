"use client";
import React from 'react';
import Header from "@/app/components/Header";
import Link from 'next/link';
import SplitViewADRForm from '@/app/components/BYOADR/byoadr';

export default function CreatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />
      <Link href="/" className="text-white mb-4">← Back to Chat</Link>
      <div className="flex-grow">
        <SplitViewADRForm />
      </div>
    </div>
  );
}