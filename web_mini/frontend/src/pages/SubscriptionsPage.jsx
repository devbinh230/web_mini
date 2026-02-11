import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Switch,
  Space, Card, Typography, Popconfirm, message, Tag, Progress,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { subscriptionApi, studentApi } from '../services/api'

export default function SubscriptionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionApi.getAll(),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: () => {
      message.success('Tao goi hoc thanh cong!')
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => subscriptionApi.update(id, data),
    onSuccess: () => {
      message.success('Cap nhat thanh cong!')
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      closeModal()
    },
    onError: (err) => message.error(err.message),
  })

  const useSessionMutation = useMutation({
    mutationFn: subscriptionApi.useSession,
    onSuccess: () => {
      message.success('Da tru 1 buoi hoc!')
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
    onError: (err) => message.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: subscriptionApi.delete,
    onSuccess: () => {
      message.success('Xoa thanh cong!')
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
    onError: (err) => message.error(err.message),
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSub(null)
    form.resetFields()
  }

  const openCreate = () => {
    setEditingSub(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record) => {
    setEditingSub(record)
    form.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      end_date: dayjs(record.end_date),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      start_date: values.start_date.format('YYYY-MM-DD'),
      end_date: values.end_date.format('YYYY-MM-DD'),
    }
    if (editingSub) {
      updateMutation.mutate({ id: editingSub.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
    {
      title: 'Hoc sinh', dataIndex: 'student_id', key: 'student_id', width: 150,
      render: (id) => {
        const s = students.find(s => s.id === id)
        return s ? s.name : `ID: ${id}`
      },
    },
    { title: 'Goi', dataIndex: 'package_name', key: 'package_name', ellipsis: true },
    {
      title: 'Tien do', key: 'progress', width: 180,
      render: (_, r) => (
        <Progress
          percent={Math.round((r.used_sessions / r.total_sessions) * 100)}
          format={() => `${r.used_sessions}/${r.total_sessions}`}
          size="small"
          status={r.used_sessions >= r.total_sessions ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: 'Thoi gian', key: 'dates', width: 200,
      render: (_, r) => `${dayjs(r.start_date).format('DD/MM/YY')} - ${dayjs(r.end_date).format('DD/MM/YY')}`,
    },
    {
      title: 'Trang thai', dataIndex: 'is_active', key: 'is_active', width: 100,
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Thao tac', key: 'action', width: 180,
      render: (_, record) => (
        <Space>
          <Popconfirm title="Tru 1 buoi hoc?" onConfirm={() => useSessionMutation.mutate(record.id)}>
            <Button icon={<MinusCircleOutlined />} size="small" disabled={!record.is_active}>
              -1
            </Button>
          </Popconfirm>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Xac nhan xoa?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={<Typography.Title level={4} style={{ margin: 0 }}>Quan ly Goi hoc</Typography.Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Them goi hoc</Button>}
        style={{ borderRadius: 12 }}
      >
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingSub ? 'Sua goi hoc' : 'Them goi hoc moi'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingSub ? 'Cap nhat' : 'Tao moi'}
        cancelText="Huy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="student_id" label="Hoc sinh" rules={[{ required: true }]}>
            <Select
              placeholder="Chon hoc sinh"
              showSearch
              optionFilterProp="label"
              options={students.map(s => ({ value: s.id, label: s.name }))}
              disabled={!!editingSub}
            />
          </Form.Item>
          <Form.Item name="package_name" label="Ten goi" rules={[{ required: true }]}>
            <Input placeholder="VD: Goi Hoc Ky 1" />
          </Form.Item>
          <Form.Item name="total_sessions" label="Tong so buoi" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 40" />
          </Form.Item>
          {editingSub && (
            <Form.Item name="used_sessions" label="So buoi da hoc">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="start_date" label="Ngay bat dau" rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="end_date" label="Ngay ket thuc" rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Space>
          {editingSub && (
            <Form.Item name="is_active" label="Trang thai" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
