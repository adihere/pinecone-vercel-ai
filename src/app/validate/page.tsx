"use client";

import Header from "../components/Header";
import Link from 'next/link';
import ValidateForm from '@/app/components/ADRvalidate/ValidateForm';

export default function ValidatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />
      <Link href="/" className="text-white mb-4">← Back to Chat</Link>
      <div className="flex-grow flex flex-col items-center justify-center">
        <ValidateForm />
      </div>
    </div>
  );
}



