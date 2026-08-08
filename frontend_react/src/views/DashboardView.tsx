import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Descriptions, Divider, Result, Row, Spin } from 'antd'
import { ApiOutlined, DesktopOutlined, ReloadOutlined } from '@ant-design/icons'
import { healthCheck } from '@/api/user'

interface HealthData {
  status: string
  timestamp: string
  service: string
  sysinfo: string
}

function DashboardView() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await healthCheck()
      setHealthData(res.data)
    } catch {
      setHealthData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return (
    <div className="home-container">
      <Row gutter={20} justify="center">
        <Col span={16}>
          <Card
            hoverable
            title={
              <div className="card-header">
                <DesktopOutlined style={{ fontSize: 28 }} />
                <span>Welcome to your Dashboard</span>
              </div>
            }
          >
            <p className="description">
              This is a full-stack demo project built with { healthData?.sysinfo ?? "(N/A)" } backend
              and React 18 + TypeScript + Ant Design frontend.
            </p>
            <Divider />
            <Descriptions title="Tech Stack" column={2} bordered>
              <Descriptions.Item label="Backend" span={2}>{ healthData?.sysinfo ?? "(N/A)" }</Descriptions.Item>
              {/* <Descriptions.Item label="Java Version">25</Descriptions.Item> */}
              <Descriptions.Item label="Frontend">React 18</Descriptions.Item>
              <Descriptions.Item label="UI Library">Ant Design 5</Descriptions.Item>
              <Descriptions.Item label="Language">TypeScript 5.4</Descriptions.Item>
              <Descriptions.Item label="Build Tool">Vite 5.2</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            hoverable
            style={{ marginTop: 20 }}
            title={
              <div className="card-header">
                <ApiOutlined style={{ fontSize: 28 }} />
                <span>Backend Health Status</span>
              </div>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <Spin size="large" />
                <p>Checking backend status...</p>
              </div>
            ) : healthData ? (
              <Result
                status={healthData.status === 'UP' ? 'success' : 'error'}
                title={healthData.status === 'UP' ? 'Backend is running' : 'Backend is down'}
                subTitle={`Service: ${healthData.service} | Timestamp: ${healthData.timestamp}`}
              />
            ) : (
              <Result
                status="warning"
                title="Cannot connect to backend"
                subTitle="Make sure the Spring Boot server is running on port 8080"
              />
            )}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={checkHealth}>
                Refresh Status
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardView
