// Add this section to the doctor dashboard for Gynecology department doctors only

{user?.department?.toLowerCase() === 'gynecology' && (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-100 rounded-lg">
          <Baby className="h-6 w-6 text-pink-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Newborn Records</h3>
          <p className="text-sm text-gray-600">Manage newborn baby birth records</p>
        </div>
      </div>
      <Link
        href="/doctor/newborn-records"
        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Manage Records
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{newbornStats.healthy}</div>
        <div className="text-green-700">Healthy</div>
      </div>
      <div className="text-center p-3 bg-yellow-50 rounded-lg">
        <div className="text-2xl font-bold text-yellow-600">{newbornStats.under_observation}</div>
        <div className="text-yellow-700">Under Observation</div>
      </div>
      <div className="text-center p-3 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{newbornStats.total}</div>
        <div className="text-blue-700">Total Records</div>
      </div>
    </div>
  </div>
)}
