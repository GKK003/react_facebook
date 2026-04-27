"use client";

import Image from "next/image";

const CONTACTS: {
  id: string;
  name: string;
  photoURL: string | null;
  online: boolean;
  lastSeen?: string;
}[] = [];

export default function RightSidebar() {
  return (
    <div className="flex flex-col w-[360px] sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide px-2 pb-4 ml-auto">
      {" "}
      <div className="px-2 mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[17px] font-semibold text-[#606770]">
            Contacts
          </span>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] flex items-center justify-center transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#606770]"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] flex items-center justify-center transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#606770]"
              >
                <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {CONTACTS.length === 0 ? (
          <div className="py-4 text-center text-[14px] text-[#8a8d91]" />
        ) : (
          <div className="space-y-1">
            {CONTACTS.map((contact) => (
              <button
                key={contact.id}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-[#f2f2f2] transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300">
                    {contact.photoURL ? (
                      <Image
                        src={contact.photoURL}
                        alt={contact.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                        {contact.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-[#050505] truncate">
                    {contact.name}
                  </span>
                  {!contact.online && contact.lastSeen && (
                    <span className="text-[12px] text-[#8a8d91] flex-shrink-0">
                      {contact.lastSeen}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="px-2 mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[17px] font-semibold text-[#606770]">
            Group chats
          </span>
          <button className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] flex items-center justify-center transition-colors"></button>
        </div>
      </div>
    </div>
  );
}
