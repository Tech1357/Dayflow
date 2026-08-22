import { useState } from 'react'
import { Plus, X, Star } from 'lucide-react'

const Skills = ({ employee, userRole, isOwnProfile }) => {
  const [skills, setSkills] = useState([
    { id: 1, name: 'JavaScript', level: 5, category: 'Programming' },
    { id: 2, name: 'React', level: 4, category: 'Frontend' },
    { id: 3, name: 'Node.js', level: 4, category: 'Backend' },
    { id: 4, name: 'Python', level: 3, category: 'Programming' },
    { id: 5, name: 'Project Management', level: 4, category: 'Soft Skills' },
    { id: 6, name: 'Communication', level: 5, category: 'Soft Skills' }
  ])

  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 3,
    category: 'Programming'
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const categories = ['Programming', 'Frontend', 'Backend', 'Database', 'DevOps', 'Soft Skills', 'Other']

  const canEdit = isOwnProfile

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([
        ...skills,
        {
          id: Date.now(),
          ...newSkill
        }
      ])
      setNewSkill({
        name: '',
        level: 3,
        category: 'Programming'
      })
      setShowAddForm(false)
    }
  }

  const handleDeleteSkill = (skillId) => {
    setSkills(skills.filter(skill => skill.id !== skillId))
  }

  const handleSkillChange = (skillId, field, value) => {
    setSkills(skills.map(skill => 
      skill.id === skillId 
        ? { ...skill, [field]: value }
        : skill
    ))
  }

  const renderStarRating = (level, skillId = null, readOnly = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readOnly && skillId && handleSkillChange(skillId, 'level', star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
            disabled={readOnly}
          >
            <Star
              className={`h-4 w-4 ${
                star <= level
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {level === 1 && 'Beginner'}
          {level === 2 && 'Novice'}
          {level === 3 && 'Intermediate'}
          {level === 4 && 'Advanced'}
          {level === 5 && 'Expert'}
        </span>
      </div>
    )
  }

  const groupedSkills = skills.reduce((groups, skill) => {
    const category = skill.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(skill)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Skills & Expertise</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showcase your technical and professional skills with proficiency levels
          </p>
        </div>
        {canEdit && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        )}
      </div>

      {/* Add Skill Form */}
      {showAddForm && canEdit && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Skill</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., JavaScript, Leadership"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency Level
              </label>
              <div className="mt-2">
                {renderStarRating(newSkill.level)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSkill}
              className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Skill
            </button>
          </div>
        </div>
      )}

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              {category}
              <span className="ml-2 text-sm text-gray-500">
                ({categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''})
              </span>
            </h4>
            
            <div className="space-y-4">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 bg-white rounded-md border"
                >
                  <div className="flex-1">
                    {canEdit ? (
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => handleSkillChange(skill.id, 'name', e.target.value)}
                        className="font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-1 py-0.5"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{skill.name}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {renderStarRating(skill.level, canEdit ? skill.id : null, !canEdit)}
                    </div>
                    
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {skills.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
          <p className="text-gray-600 mb-4">
            Start building your skills profile to showcase your expertise
          </p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </button>
          )}
        </div>
      )}

      {/* Skill Level Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Skill Level Guide</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {renderStarRating(1, null, true)}
            </div>
            <span>Beginner - Basic understanding</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {renderStarRating(2, null, true)}
            </div>
            <span>Novice - Limited experience</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {renderStarRating(3, null, true)}
            </div>
            <span>Intermediate - Practical application</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {renderStarRating(4, null, true)}
            </div>
            <span>Advanced - Extensive experience</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {renderStarRating(5, null, true)}
            </div>
            <span>Expert - Recognized expertise</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills