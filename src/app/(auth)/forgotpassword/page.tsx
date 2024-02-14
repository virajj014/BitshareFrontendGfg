"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import styles from '@/styles/auth.module.css'

interface FormData {
  email: string,
  password: string,
}




const Page = () => {

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  } as FormData)

  const [otp, setOtp] = React.useState('')
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value })
  }
  const [sendingOtp, setSendingOtp] = useState<boolean>(false)
  const sendOtp = async () => {
    setSendingOtp(true)
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/sendotp', {
      method: 'POST',
      body: JSON.stringify({ email: formData.email }),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    let data = await res.json()
    setSendingOtp(false)

    if (data.ok) {
      toast.success('OTP sent')
    }
    else {
      toast.error(data.message)
    }

  }



  const Router = useRouter()
  const handleSubmit = async () => {
    if (formData.email == '' || formData.password == '' || otp == '') {
      toast.error('Please fill all the fields')
      return
    }





    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/changepassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: formData.email, password: formData.password, otp }),
      credentials: 'include'
    })

    let data = await res.json()
    if (data.ok) {
      toast.success('Password changed')
      Router.push('/login')
    }

    else {
      toast.error(data.message)
    }
  }


  return (
    <div className={styles.authpage}>
      <div className={styles.authcontainer}>
        <h1>Forgot Password</h1>

        <div className={styles.inputcontaner1}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputrow}>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} />
            {
              !sendingOtp ?
                <button onClick={sendOtp}>Send OTP</button>
                :
                <button style={{
                  backgroundColor: 'gray',
                  cursor: 'not-allowed'
                }}>Sending OTP</button>

            }
          </div>
        </div>

        <div className={styles.inputcontaner}>
          <label htmlFor="otp">OTP</label>
          <input type="password" name="otp" id="otp" value={otp} onChange={e => setOtp(e.target.value)} />
        </div>

        <div className={styles.inputcontaner}>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} />
        </div>

        <button
          className={styles.button1}
          type="button"
          onClick={handleSubmit}
        >Change Password</button>

      </div>
    </div>
  )
}

export default Page