import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Space, Card, Typography, Popconfirm, message, Tag, Tooltip,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { studentApi, parentApi } from '../services/api'

const genderOptions = [
  { value: 'Male', label: 'Nam' },
  { value: 'Female', label: 'Nữ' },
  { value: 'Other', label: 'Khác' },
]

const genderLabels = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' }
const genderColor = { Male: 'blue', Female: 'pink', Other: 'default' }

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentApi.getAll(),
  })

  const { data: parents = [] } = useQuery({
    queryKey: ['parents'],
    queryFn: () => parentApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => {
      message.success('Tạo học sinh thành công!')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật thành công!')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      message.success('Xóa thành công!')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (err) => message.error(err.message),
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStudent(null)
    form.resetFields()
  }

  const openCreate = () => {
    setEditingStudent(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record) => {
    setEditingStudent(record)
    form.setFieldsValue({
      ...record,
      dob: record.dob ? dayjs(record.dob) : null,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
    }
    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchText.toLowerCase())
  )

  const calcAge = (dob) => {
    if (!dob) return null
    const years = dayjs().diff(dayjs(dob), 'year')
    return years
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
    {
      title: 'Họ tên', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (name) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: 'Ngày sinh', dataIndex: 'dob', key: 'dob', width: 130,
      render: (v) => v ? (
        <Space size={4}>
          <span>{dayjs(v).format('DD/MM/YYYY')}</span>
          <Tag style={{ margin: 0 }}>{calcAge(v)} tuổi</Tag>
        </Space>
      ) : <Typography.Text type="secondary">-</Typography.Text>,
    },
    {
      title: 'Giới tính', dataIndex: 'gender', key: 'gender', width: 90,
      render: (v) => v ? <Tag color={genderColor[v] || 'default'}>{genderLabels[v] || v}</Tag> : '-',
    },
    {
      title: 'Lớp', dataIndex: 'current_grade', key: 'current_grade', width: 70, align: 'center',
      render: (v) => v ? <Tag color="geekblue">Lớp {v}</Tag> : '-',
    },
    {
      title: 'Phụ huynh', dataIndex: 'parent_id', key: 'parent_id', width: 160,
      render: (parentId) => {
        const parent = parents.find(p => p.id === parentId)
        return parent ? (
          <Tooltip title={`SĐT: ${parent.phone}`}>
            <Typography.Text>{parent.name}</Typography.Text>
          </Tooltip>
        ) : <Typography.Text type="secondary">ID: {parentId}</Typography.Text>
      },
    },
    {
      title: 'Thao tác', key: 'action', width: 120, align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Các đăng ký và gói học liên quan cũng sẽ bị xóa."
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
            <Typography.Title level={4} style={{ margin: 0 }}>Quản lý Học sinh</Typography.Title>
            <Tag color="blue">{students.length}</Tag>
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
              Thêm học sinh
            </Button>
          </Space>
        }
        style={{ borderRadius: 16 }}
      >
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng: ${total} học sinh` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingStudent ? 'Sửa thông tin học sinh' : 'Thêm học sinh mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingStudent ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="VD: Nguyễn Minh Khôi" />
          </Form.Item>
          <Form.Item name="dob" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <Select options={genderOptions} placeholder="Chọn giới tính" allowClear />
          </Form.Item>
          <Form.Item name="current_grade" label="Lớp hiện tại">
            <InputNumber min={1} max={12} style={{ width: '100%' }} placeholder="VD: 4" />
          </Form.Item>
          <Form.Item name="parent_id" label="Phụ huynh" rules={[{ required: true, message: 'Vui lòng chọn phụ huynh!' }]}>
            <Select
              placeholder="Chọn phụ huynh"
              showSearch
              optionFilterProp="label"
              options={parents.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
              notFoundContent="Chưa có phụ huynh nào. Vui lòng tạo phụ huynh trước."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
