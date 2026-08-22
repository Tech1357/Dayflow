import { useState } from 'react'
import { Upload, Download, FileText, Trash2, Plus } from 'lucide-react'

const Resume = ({ employee, userRole, isOwnProfile }) => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'John_Doe_Resume_2024.pdf',
      type: 'Resume',
      uploadDate: '2024-01-15',
      size: '245 KB'
    },
    {
      id: 2,
      name: 'Software_Engineer_Certificate.pdf',
      type: 'Certificate',
      uploadDate: '2024-01-10',
      size: '180 KB'
    }
  ])

  const canEdit = isOwnProfile || userRole === 'admin'

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const newDocument = {
        id: Date.now(),
        name: file.name,
        type: 'Document',
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`
      }
      setDocuments([...documents, newDocument])
    }
  }

  const handleDelete = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-400" />
            Resume & Documents
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage professional documents, certificates, and resume
          </p>
        </div>
        {canEdit && (
          <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
          </label>
        )}
      </div>

      {/* About Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">About</h4>
        {canEdit ? (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Write a brief professional summary about yourself..."
            defaultValue="Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        ) : (
          <p className="text-gray-700">
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Skills</h4>
          {canEdit && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              + Add Skill
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 
            'AWS', 'Docker', 'MongoDB', 'TypeScript'
          ].map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Certifications</h4>
          {canEdit && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              + Add Certification
            </button>
          )}
        </div>
        <div className="space-y-3">
          {[
            { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
            { name: 'Certified Scrum Master', issuer: 'Scrum Alliance', date: '2022' }
          ].map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
              <div>
                <p className="font-medium text-gray-900">{cert.name}</p>
                <p className="text-sm text-gray-600">{cert.issuer} • {cert.date}</p>
              </div>
              {canEdit && (
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Uploaded Documents</h4>
        
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents uploaded yet</p>
            {canEdit && (
              <p className="text-sm text-gray-400 mt-2">
                Upload your resume, certificates, or other professional documents
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white rounded-md border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-600">
                      {doc.type} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()} • {doc.size}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Download className="h-4 w-4" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Document Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Supported formats: PDF, DOC, DOCX, TXT</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Keep documents up to date and relevant</li>
          <li>• Use clear, descriptive file names</li>
        </ul>
      </div>
    </div>
  )
}

export default Resume