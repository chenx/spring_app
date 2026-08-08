import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, message, Modal, Select, Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { createUser, deleteUser, getUsers, updateUser } from '@/api/user'
import type { User, UserRequest } from '@/types'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

function UserView() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<UserRequest>()

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    setIsEdit(false)
    setEditingId(0)
    form.setFieldsValue({ username: '', email: '', role: 'USER' })
    setDialogVisible(true)
  }

  function handleEdit(row: User) {
    setIsEdit(true)
    setEditingId(row.id)
    form.setFieldsValue({ username: row.username, email: row.email, role: row.role })
    setDialogVisible(true)
  }

  function handleDelete(row: User) {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete user "${row.username}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await deleteUser(row.id)
          message.success('User deleted successfully')
          await fetchUsers()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete user')
        }
      },
    })
  }

  async function submitForm() {
    const values = await form.validateFields().catch(() => null)
    if (!values) return

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateUser(editingId, values)
        message.success('User updated successfully')
      } else {
        await createUser(values)
        message.success('User created successfully')
      }
      setDialogVisible(false)
      await fetchUsers()
    } catch (err: any) {
      message.error(err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
    { title: 'Username', dataIndex: 'username', width: 150 },
    { title: 'Email', dataIndex: 'email', width: 220 },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 120,
      align: 'center',
      render: (role: string) => <Tag color={role === 'ADMIN' ? 'red' : 'default'}>{role}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: 200,
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 200,
      align: 'center',
      render: (_, row) => {
        const isDefaultAccount = [1, 2].includes(Number(row.id))
        return (
          <>
            <Tooltip title={isDefaultAccount ? 'Cannot edit default testing account' : ''}>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                disabled={isDefaultAccount}
                onClick={() => handleEdit(row)}
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title={isDefaultAccount ? 'Cannot delete default testing account' : ''}>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={isDefaultAccount}
                onClick={() => handleDelete(row)}
              >
                Delete
              </Button>
            </Tooltip>
          </>
        )
      },
    },
  ]

  return (
    <div className="user-container">
      <Card
        hoverable
        title={<span style={{ fontSize: 18, fontWeight: 'bold' }}>User Management</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add User
          </Button>
        }
      >
        <Table<User> rowKey="id" dataSource={users} columns={columns} loading={loading} bordered pagination={false} />
      </Card>

      {/* Add/Edit Dialog */}
      <Modal
        title={isEdit ? 'Edit User' : 'Add User'}
        open={dialogVisible}
        width={500}
        destroyOnHidden
        forceRender
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={submitting} onClick={submitForm}>
            {isEdit ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form form={form} labelCol={{ span: 6 }} labelAlign="right" initialValues={{ role: 'USER' }}>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please enter username' },
              { min: 2, max: 50, message: 'Username must be 2-50 characters' },
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select
              placeholder="Select role"
              options={[
                { label: 'User', value: 'USER' },
                { label: 'Admin', value: 'ADMIN' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserView
