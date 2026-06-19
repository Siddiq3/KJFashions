export default function Privacy() {
  return (
    <div className="container-page py-12">
      <div className="max-w-3xl rounded-md border border-primary-100 bg-white p-7 shadow-sm">
        <h1 className="text-5xl font-semibold text-store-dark">Privacy Policy</h1>
        <p className="mt-5 text-sm leading-7 text-store-dark/70">
          Khwaja Texttiles & Radymade does not require login or store customer accounts. Cart items stay in your browser localStorage. Order details are shared only when you submit the form and continue through WhatsApp.
        </p>
        <p className="mt-4 text-sm leading-7 text-store-dark/70">
          Product data is loaded from public GitHub JSON files and product images are served from the GitHub repository configured by the store owner.
        </p>
      </div>
    </div>
  );
}
