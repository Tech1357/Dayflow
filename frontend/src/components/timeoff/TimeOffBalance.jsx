import { Calendar, Clock, Plane, Heart } from 'lucide-react'

const TimeOffBalance = ({ balances, userRole }) => {
  const { paidTimeOff, sickTimeOff } = balances

  const balanceCards = [
    {
      id: 'paid',
      title: 'Paid Time Off',
      available: paidTimeOff.available,
      used: paidTimeOff.used,
      total: paidTimeOff.total,
      icon: Plane,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      id: 'sick',
      title: 'Sick Time Off',
      available: sickTimeOff.available,
      used: sickTimeOff.used,
      total: sickTimeOff.total,
      icon: Heart,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      iconColor: 'text-green-500'
    }
  ]

  const getProgressBarColor = (available, total) => {
    const percentage = (available / total) * 100
    if (percentage > 60) return 'bg-green-500'
    if (percentage > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {balanceCards.map((card) => {
          const IconComponent = card.icon
          const usagePercentage = (card.used / card.total) * 100
          const availablePercentage = (card.available / card.total) * 100

          return (
            <div
              key={card.id}
              className={`bg-white rounded-lg border p-6 ${card.borderColor} ${card.bgColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-white border ${card.borderColor}`}>
                    <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.total} Days Available</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{card.available}</div>
                  <div className="text-sm text-gray-600">Days Available</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Used: {card.used} days</span>
                  <span>Remaining: {card.available} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressBarColor(card.available, card.total)}`}
                    style={{ width: `${availablePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>{card.total}</span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{card.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">{card.used}</div>
                  <div className="text-xs text-gray-500">Used</div>
                </div>
                <div>
                  <div className={`text-lg font-semibold ${card.textColor}`}>{card.available}</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
              </div>

              {/* Quick Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {card.available === 0 && (
                  <div className="text-center text-sm text-red-600 font-medium">
                    ⚠️ No {card.title.toLowerCase()} remaining
                  </div>
                )}
                {card.available > 0 && card.available <= 3 && (
                  <div className="text-center text-sm text-yellow-600 font-medium">
                    ⚡ Low balance - {card.available} days left
                  </div>
                )}
                {card.available > 3 && (
                  <div className="text-center text-sm text-green-600 font-medium">
                    ✅ Good balance - {card.available} days available
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Info for Employees */}
      {userRole === 'employee' && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Time Off Policy</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Paid time off accrues at 2.5 days per month</p>
            <p>• Sick leave accrues at 0.83 days per month</p>
            <p>• Unused PTO up to 5 days can be carried over to next year</p>
            <p>• Time off requests should be submitted at least 2 weeks in advance</p>
            <p>• Sick leave requires manager approval for 3+ consecutive days</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeOffBalance