import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Space, Card, Typography, Popconfirm, message, Tag, Tooltip,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parentApi } from '../services/api'

export default function ParentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParent, setEditingParent] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: () => parentApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: parentApi.create,
    onSuccess: () => {
      message.success('Tạo phụ huynh thành công!')
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => parentApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật thành công!')
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: parentApi.delete,
    onSuccess: () => {
      message.success('Xóa thành công!')
      queryClient.invalidateQueries({ queryKey: ['parents'] })
    },
    onError: (err) => message.error(err.message),
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingParent(null)
    form.resetFields()
  }

  const openCreate = () => {
    setEditingParent(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record) => {
    setEditingParent(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editingParent) {
      updateMutation.mutate({ id: editingParent.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const filteredParents = parents.filter(p =>
    p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.phone?.includes(searchText) ||
    p.email?.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
    {
      title: 'Họ tên', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (name) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: 'Số điện thoại', dataIndex: 'phone', key: 'phone',
      render: (phone) => (
        <Space size={4}>
          <PhoneOutlined style={{ color: '#3b82f6' }} />
          <Tag color="blue">{phone}</Tag>
        </Space>
      ),
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true,
      render: (email) => email ? (
        <Space size={4}>
          <MailOutlined style={{ color: '#64748b' }} />
          <span>{email}</span>
        </Space>
      ) : <Typography.Text type="secondary">-</Typography.Text>,
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
            description="Tất cả học sinh liên quan cũng sẽ bị xóa."
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
            <Typography.Title level={4} style={{ margin: 0 }}>Quản lý Phụ huynh</Typography.Title>
            <Tag color="blue">{parents.length}</Tag>
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
              Thêm phụ huynh
            </Button>
          </Space>
        }
        style={{ borderRadius: 16 }}
      >
        <Table
          columns={columns}
          dataSource={filteredParents}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng: ${total} phụ huynh` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingParent ? 'Sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingParent ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[
            { required: true, message: 'Vui lòng nhập SĐT!' },
            { pattern: /^0\d{9}$/, message: 'SĐT phải có 10 số, bắt đầu bằng 0' },
          ]}>
            <Input placeholder="VD: 0901234567" maxLength={10} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}>
            <Input placeholder="VD: email@example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
