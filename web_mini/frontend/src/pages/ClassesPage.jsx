import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, TimePicker,
  Space, Card, Typography, Popconfirm, message, Tag, Tabs, Progress, Tooltip, Row, Col,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UnorderedListOutlined, CalendarOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { classApi } from '../services/api'
import React from 'react'

const dayOptions = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
]

const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const dayColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6']

// Subject-based color mapping for the schedule grid
const subjectColors = {
  'Toan': { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  'Tieng Viet': { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
  'Tieng Anh': { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
  'Khoa Hoc': { bg: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6' },
  'My Thuat': { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' },
  'Am Nhac': { bg: '#fff7ed', border: '#fb923c', text: '#9a3412' },
  'The Duc': { bg: '#f0fdfa', border: '#5eead4', text: '#134e4a' },
  'Tin Hoc': { bg: '#f0f9ff', border: '#7dd3fc', text: '#0c4a6e' },
}

const defaultSubjectColor = { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' }

// Time slots for the schedule grid
const timeSlots = [
  { label: '7:00\n8:30', start: '07:00', end: '08:30' },
  { label: '8:00\n9:30', start: '08:00', end: '09:30' },
  { label: '9:00\n10:30', start: '09:00', end: '10:30' },
  { label: '10:00\n11:30', start: '10:00', end: '11:30' },
  { label: '14:00\n15:30', start: '14:00', end: '15:30' },
  { label: '15:30\n17:00', start: '15:30', end: '17:00' },
]

function ScheduleGrid({ classes }) {
  const getClassesForCell = (dayIdx, slot) => {
    return (classes || []).filter((c) => {
      if (c.day_of_week !== dayIdx) return false
      const cStart = c.time_slot_start
      const cEnd = c.time_slot_end
      return cStart < slot.end && cEnd > slot.start
    })
  }

  return (
    <div className="schedule-grid">
      {/* Header row */}
      <div className="schedule-header">Ca học</div>
      {dayLabels.map((day, i) => (
        <div className="schedule-header" key={`header-${i}`}>{day}</div>
      ))}

      {/* Data rows */}
      {timeSlots.map((slot, slotIdx) => (
        <React.Fragment key={`slot-${slotIdx}`}>
          <div className="schedule-time-label" style={{ whiteSpace: 'pre-line' }}>
            {slot.label}
          </div>
          {dayLabels.map((_, dayIdx) => {
            const cellClasses = getClassesForCell(dayIdx, slot)
            return (
              <div className="schedule-cell" key={`cell-${slotIdx}-${dayIdx}`}>
                {cellClasses.map((c) => {
                  const colors = subjectColors[c.subject] || defaultSubjectColor
                  return (
                    <Tooltip
                      key={c.id}
                      title={`${c.name} | ${c.subject} | GV: ${c.teacher_name} | ${c.current_students}/${c.max_students} HS`}
                    >
                      <div
                        className="schedule-class-tag"
                        style={{
                          background: colors.bg,
                          borderColor: colors.border,
                          color: colors.text,
                        }}
                      >
                        <strong>{c.name}</strong>
                        <br />
                        <small>{c.teacher_name} ({c.current_students}/{c.max_students})</small>
                      </div>
                    </Tooltip>
                  )
                })}
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: classApi.create,
    onSuccess: () => {
      message.success('Tạo lớp học thành công!')
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => classApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật thành công!')
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: classApi.delete,
    onSuccess: () => {
      message.success('Xóa thành công!')
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (err) => message.error(err.message),
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClass(null)
    form.resetFields()
  }

  const openCreate = () => {
    setEditingClass(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record) => {
    setEditingClass(record)
    form.setFieldsValue({
      ...record,
      time_slot_start: dayjs(record.time_slot_start, 'HH:mm:ss'),
      time_slot_end: dayjs(record.time_slot_end, 'HH:mm:ss'),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      time_slot_start: values.time_slot_start.format('HH:mm:ss'),
      time_slot_end: values.time_slot_end.format('HH:mm:ss'),
    }
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const filteredClasses = classes.filter(c =>
    c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.teacher_name?.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 50, align: 'center' },
    {
      title: 'Tên lớp', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (name) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: 'Môn học', dataIndex: 'subject', key: 'subject', width: 120,
      render: (subject) => {
        const colors = subjectColors[subject] || defaultSubjectColor
        return <Tag style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}>{subject}</Tag>
      },
    },
    { title: 'Giáo viên', dataIndex: 'teacher_name', key: 'teacher_name', width: 120 },
    {
      title: 'Thứ', dataIndex: 'day_of_week', key: 'day_of_week', width: 80, align: 'center',
      render: (v) => <Tag color={dayColors[v]}>{dayLabels[v]}</Tag>,
    },
    {
      title: 'Giờ học', key: 'time', width: 130,
      render: (_, r) => `${r.time_slot_start?.slice(0, 5)} - ${r.time_slot_end?.slice(0, 5)}`,
    },
    {
      title: 'Sĩ số', key: 'capacity', width: 140,
      render: (_, r) => (
        <Progress
          percent={Math.round(((r.current_students || 0) / r.max_students) * 100)}
          format={() => `${r.current_students || 0}/${r.max_students}`}
          size="small"
          status={(r.current_students || 0) >= r.max_students ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: 'Thao tác', key: 'action', width: 120, align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa lớp này?"
            description="Tất cả đăng ký liên quan sẽ bị xóa."
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>Quản lý Lớp học</Typography.Title>
            <Tag color="blue">{classes.length}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220, borderRadius: 8 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm lớp học
            </Button>
          </Space>
        }
        style={{ borderRadius: 16 }}
      >
        <Tabs
          defaultActiveKey="table"
          items={[
            {
              key: 'table',
              label: <Space><UnorderedListOutlined />Danh sách</Space>,
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredClasses}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{ pageSize: 10, showTotal: (total) => `Tổng: ${total} lớp` }}
                  size="middle"
                />
              ),
            },
            {
              key: 'schedule',
              label: <Space><CalendarOutlined />Thời khóa biểu</Space>,
              children: <ScheduleGrid classes={classes} />,
            },
          ]}
        />
      </Card>

      <Modal
        title={editingClass ? 'Sửa lớp học' : 'Thêm lớp học mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingClass ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
                <Input placeholder="VD: Toán Nâng Cao 4" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="max_students" label="Sĩ số tối đa" initialValue={30}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="subject" label="Môn học" rules={[{ required: true, message: 'Vui lòng nhập môn học!' }]}>
                <Input placeholder="VD: Toán" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teacher_name" label="Giáo viên" rules={[{ required: true, message: 'Vui lòng nhập tên GV!' }]}>
                <Input placeholder="VD: Cô Mai" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="day_of_week" label="Thứ" rules={[{ required: true, message: 'Chọn thứ!' }]}>
                <Select options={dayOptions} placeholder="Chọn thứ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="time_slot_start" label="Giờ bắt đầu" rules={[{ required: true, message: 'Chọn giờ!' }]}>
                <TimePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="time_slot_end" label="Giờ kết thúc" rules={[{ required: true, message: 'Chọn giờ!' }]}>
                <TimePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
