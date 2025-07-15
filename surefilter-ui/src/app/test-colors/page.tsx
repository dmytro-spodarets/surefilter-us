export default function TestColors() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Color Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sure Blue Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 bg-sure-blue-100 text-sure-blue-900 rounded">
            bg-sure-blue-100
          </div>
          <div className="p-4 bg-sure-blue-300 text-sure-blue-900 rounded">
            bg-sure-blue-300
          </div>
          <div className="p-4 bg-sure-blue-500 text-white rounded">
            bg-sure-blue-500
          </div>
          <div className="p-4 bg-sure-blue-700 text-white rounded">
            bg-sure-blue-700
          </div>
          <div className="p-4 bg-sure-blue-900 text-white rounded">
            bg-sure-blue-900
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sure Orange Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 bg-sure-orange-100 text-sure-orange-900 rounded">
            bg-sure-orange-100
          </div>
          <div className="p-4 bg-sure-orange-300 text-sure-orange-900 rounded">
            bg-sure-orange-300
          </div>
          <div className="p-4 bg-sure-orange-500 text-white rounded">
            bg-sure-orange-500
          </div>
          <div className="p-4 bg-sure-orange-700 text-white rounded">
            bg-sure-orange-700
          </div>
          <div className="p-4 bg-sure-orange-900 text-white rounded">
            bg-sure-orange-900
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Text Colors</h2>
        <div className="space-y-2">
          <p className="text-sure-blue-500">This text should be sure-blue-500</p>
          <p className="text-sure-orange-500">This text should be sure-orange-500</p>
          <p className="text-sure-blue-700">This text should be sure-blue-700</p>
          <p className="text-sure-orange-700">This text should be sure-orange-700</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-sure-orange-500 text-white rounded-lg hover:bg-sure-orange-600 transition-colors">
            Orange Button
          </button>
          <button className="px-6 py-3 bg-sure-blue-500 text-white rounded-lg hover:bg-sure-blue-600 transition-colors">
            Blue Button
          </button>
        </div>
      </div>
    </div>
  );
} 