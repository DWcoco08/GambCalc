const BADGE_COLORS = {
  orange: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  red: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
  'red-light': 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  'red-dark': 'bg-gradient-to-r from-red-700 to-red-900 text-red-200',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
  gray: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white',
  black: 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300',
  demon: 'bg-gradient-to-r from-red-600 via-purple-600 to-red-600 text-white animate-demon-badge shadow-lg shadow-red-500/50',
}

export default function GameGuide({ guide }) {
  if (!guide) return null

  return (
    <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/15 overflow-hidden animate-fade-in">
      <div className="p-5 lg:p-6 pb-3 lg:pb-4 border-b border-white/10">
        <h3 className="text-base lg:text-lg font-extrabold text-white">
          {guide.title}
        </h3>
      </div>
      <div className="p-5 lg:p-6 space-y-5 lg:space-y-6 max-h-[75vh] overflow-y-auto">
        {guide.sections.map((section, i) => (
          <div key={i}>
            <h4 className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              {section.heading}
            </h4>

            {/* Text items */}
            {section.items && (
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-xs lg:text-sm text-gray-300 leading-relaxed">
                    <span className="text-purple-400 shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Table */}
            {section.table && (
              <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/80">
                <table className="w-full text-xs lg:text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      {section.table[0].map((h, k) => (
                        <th key={k} className="px-3 py-2.5 text-left font-bold text-gray-400 uppercase tracking-wider text-[10px] lg:text-xs">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.slice(1).map((row, ri) => (
                      <tr key={ri} className="border-t border-gray-100 dark:border-gray-700/50">
                        {row.map((cell, ci) => (
                          <td key={ci} className={`px-3 py-2.5 font-medium ${
                            cell.startsWith('+') ? 'text-green-500 font-bold' :
                            cell.startsWith('-') ? 'text-red-500 font-bold' :
                            'text-gray-300'
                          }`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Badges */}
            {section.badges && (
              <div className="space-y-2">
                {section.badges.map((badge, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-extrabold shadow-sm ${BADGE_COLORS[badge.color] || BADGE_COLORS.gray}`}>
                      {badge.icon}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-300">
                      {badge.desc}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
