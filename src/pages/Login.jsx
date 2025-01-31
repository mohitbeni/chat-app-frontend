import { useContext } from 'react'
import { Alert, Button, Form, Row, Col, Stack } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'
const Login = () => {
  const {
    updateLoginInfo,
    loginUser,
    loginError,
    isLoginLoading,
    loginInfo,
    logoutUser,
  } = useContext(AuthContext)
  return (
    <>
      <Form onSubmit={loginUser}>
        <Row
          style={{
            height: '100vh',
            justifyContent: 'center',
            paddingTop: '10%',
          }}
        >
          <Col xs={6}>
            <Stack gap={3}>
              <h2>Login</h2>

              <Form.Control
                type="email"
                placeholder="Enter email"
                onChange={(e) =>
                  updateLoginInfo({
                    ...loginInfo,
                    email: e.target.value,
                  })
                }
              />
              <Form.Control
                type="password"
                placeholder="Enter password"
                onChange={(e) =>
                  updateLoginInfo({
                    ...loginInfo,
                    password: e.target.value,
                  })
                }
              />
              <Button variant="primary" type="submit">
                {isLoginLoading ? 'Getting you in' : 'Login'}
              </Button>
              {loginError?.error && (
                <Alert variant="danger">
                  <p>{loginError?.message}</p>
                </Alert>
              )}
            </Stack>
          </Col>
        </Row>
      </Form>
    </>
  )
}
export default Login
