import React from 'react';

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: any[]; // Replace with your actual notification type
}

const NotificationsModal: React.FC<NotificationModalProps> = ({ isVisible, onClose, notifications }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-end pt-12 pr-5">
      <div className="bg-white z-40 rounded-lg p-4 w-4/5 sm:w-3/5 lg:w-2/5">
        <div className="flex flex-row items-center justify-between mb-3">
          <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">
            Notifications
          </h1>
          <div
            onClick={onClose}
            className="border rounded-lg border-[#6A6E6F] cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100">
            <h1 className="font-ubuntu font-medium w-fit text-sm text-[#6A6E6F] px-2 py-1 group-hover:text-white">
              Close
            </h1>
          </div>
        </div>
        <div
          className='flex w-full flex-col items-start justify-start overflow-y-auto max-h-96'
        >
          {notifications?.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul>
              {notifications.map((notification, index) => (
                <li key={index} className="border-b py-2">
                  {notification?.title}
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>
    </div>
  );
};

export default NotificationsModal;
