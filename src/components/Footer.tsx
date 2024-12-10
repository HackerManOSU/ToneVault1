// src/components/Footer.tsx

const Footer = () => (
  <footer className="bg-gray-800 text-white mt-auto py-4 h-[10vh]">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Tone Vault</h3>
          <p className="text-sm">Keep track of your guitar collection</p>
        </div>
        <div className="text-sm">
          <p>© {new Date().getFullYear()} Tone Vault </p>
          <p>All rights reserved</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;