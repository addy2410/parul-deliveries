
import React from "react";

const VendorAuthDemoCredentials: React.FC = () => {
  return (
    <div className="text-center text-xs text-gray-500 mt-4">
      <p>For demonstration purposes, enter any PUCAMPID that starts with "VEN" (like VEN12345) and a password with at least 6 characters.</p>
      <p className="mt-1">Or try the default restaurants with these credentials:</p>
      <p className="font-semibold mt-1">CAPITOL-VENDOR / GREENZY-VENDOR / MAIN-VENDOR</p>
      <p>Password for all: campus123</p>
    </div>
  );
};

export default VendorAuthDemoCredentials;
