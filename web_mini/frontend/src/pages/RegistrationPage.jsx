import { useState } from 'react'
import {
  Card, Select, Button, Typography, message, Alert, Table, Tag, Space, Popconfirm, Divider, Row, Col,
} from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi, classApi } from '../services/api'

const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function RegistrationPage() {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [error, setError] = useState(null)
  const queryClient = useQueryClient()

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentApi.getAll(),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classApi.getAll(),
  })

  // Get students for a selected class
  const { data: classStudents = [], isLoading: loadingClassStudents } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: () => classApi.getStudents(selectedClass),
    enabled: !!selectedClass,
  })

  const registerMutation = useMutation({
    mutationFn: ({ classId, studentId }) => classApi.register(classId, studentId),
    onSuccess: () => {
      message.success('Dang ky thanh cong!')
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['class-students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (err) => {
      setError(err.message)
      message.error(err.message)
    },
  })

  const unregisterMutation = useMutation({
    mutationFn: ({ classId, studentId }) => classApi.unregister(classId, studentId),
    onSuccess: () => {
      message.success('Huy dang ky thanh cong!')
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['class-students'] })
    },
    onError: (err) => message.error(err.message),
  })

  const handleRegister = () => {
    if (!selectedStudent || !selectedClass) {
      message.warning('Vui long chon hoc sinh va lop hoc!')
      return
    }
    setError(null)
    registerMutation.mutate({ classId: selectedClass, studentId: selectedStudent })
  }

  const selectedClassInfo = classes.find(c => c.id === selectedClass)

  const classStudentColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Ho ten', dataIndex: 'name', key: 'name' },
    { title: 'Gioi tinh', dataIndex: 'gender', key: 'gender', width: 90 },
    { title: 'Lop', dataIndex: 'current_grade', key: 'current_grade', width: 60 },
    {
      title: 'Thao tac', key: 'action', width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Huy dang ky hoc sinh nay?"
          onConfirm={() => unregisterMutation.mutate({ classId: selectedClass, studentId: record.id })}
        >
          <Button size="small" danger icon={<CloseCircleOutlined />}>Huy</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>Dang ky lop hoc</Typography.Title>

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="Dang ky moi" style={{ borderRadius: 12, marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Typography.Text strong>Chon hoc sinh:</Typography.Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Tim va chon hoc sinh..."
                  showSearch
                  optionFilterProp="label"
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                  options={students.map(s => ({
                    value: s.id,
                    label: `${s.name} (Lop ${s.current_grade || '?'})`,
                  }))}
                  size="large"
                />
              </div>

              <div>
                <Typography.Text strong>Chon lop hoc:</Typography.Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Tim va chon lop hoc..."
                  showSearch
                  optionFilterProp="label"
                  value={selectedClass}
                  onChange={(v) => { setSelectedClass(v); setError(null); }}
                  options={classes.map(c => ({
                    value: c.id,
                    label: `${c.name} - ${dayLabels[c.day_of_week]} ${c.time_slot_start?.slice(0, 5)}-${c.time_slot_end?.slice(0, 5)} (${c.current_students}/${c.max_students})`,
                  }))}
                  size="large"
                />
              </div>

              {selectedClassInfo && (
                <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
                  <Typography.Text>
                    <strong>{selectedClassInfo.name}</strong> | {selectedClassInfo.subject} | GV: {selectedClassInfo.teacher_name}
                    <br />
                    {dayLabels[selectedClassInfo.day_of_week]} | {selectedClassInfo.time_slot_start?.slice(0, 5)} - {selectedClassInfo.time_slot_end?.slice(0, 5)}
                    <br />
                    Si so: <Tag color={selectedClassInfo.current_students >= selectedClassInfo.max_students ? 'red' : 'green'}>
                      {selectedClassInfo.current_students}/{selectedClassInfo.max_students}
                    </Tag>
                  </Typography.Text>
                </Card>
              )}

              {error && (
                <Alert
                  message="Loi dang ky"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                />
              )}

              <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined />}
                onClick={handleRegister}
                loading={registerMutation.isPending}
                disabled={!selectedStudent || !selectedClass}
              >
                Dang ky
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={selectedClassInfo ? `Hoc sinh trong lop: ${selectedClassInfo.name}` : 'Chon lop de xem danh sach'}
            style={{ borderRadius: 12 }}
          >
            {selectedClass ? (
              <Table
                columns={classStudentColumns}
                dataSource={classStudents}
                rowKey="id"
                loading={loadingClassStudents}
                pagination={false}
                size="small"
              />
            ) : (
              <Typography.Text type="secondary">
                Chon mot lop hoc o ben trai de xem danh sach hoc sinh da dang ky.
              </Typography.Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
