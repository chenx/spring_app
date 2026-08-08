'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, Col, Descriptions, Divider, Row } from 'antd'
import { DesktopOutlined } from '@ant-design/icons'
import { healthCheck } from '@/lib/api'

interface HealthData {
  status: string
  timestamp: string
  service: string
  sysinfo: string
}

export default function HomePage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      const res = await healthCheck()
      setHealthData(res.data)
    } catch {
      setHealthData(null)
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
                <span>Welcome to Spring App</span>
              </div>
            }
          >
            <p className="description">
              Full-stack demo project built with { healthData?.sysinfo ?? "(N/A)" } backend and Next.js +
              TypeScript + Ant Design frontend, talking to the backend through a
              backend-for-frontend (BFF) layer of Next.js API routes.
            </p>
            <Divider />
            <Descriptions title="Tech Stack" column={2} bordered>
              <Descriptions.Item label="Backend" span={2}>{ healthData?.sysinfo ?? "(N/A)" }</Descriptions.Item>
              {/* <Descriptions.Item label="Java Version">25</Descriptions.Item> */}
              <Descriptions.Item label="Frontend">Next.js (App Router)</Descriptions.Item>
              <Descriptions.Item label="UI Library">Ant Design 5</Descriptions.Item>
              <Descriptions.Item label="Language">TypeScript 5.4</Descriptions.Item>
              <Descriptions.Item label="Architecture">Backend-for-Frontend (BFF)</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
