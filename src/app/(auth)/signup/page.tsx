"use client"
import React, { useState } from 'react'
import styles from '@/styles/auth.module.css'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import Link from 'next/link'


interface FormData {
  name: string,
  email: string,
  password: string,
}

const Page = () => {
  const Router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: '',
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
  const handleSignup = async () => { 
    if (formData.name == "" || formData.email == '' || formData.password == '' || otp == '') {
      toast.error('Please fill all the fields')
      return
    }
    let formdata = new FormData();

    formdata.append('name', formData.name);
    formdata.append('email', formData.email);
    formdata.append('password', formData.password);
    formdata.append('otp', otp);
    if (imageFile) {
      formdata.append('clientfile', imageFile)
    }
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/register', {
      method: 'POST',
      body: formdata,
      credentials: 'include'
    })

    let data = await res.json()
    if (data.ok) {
      toast.success('Signup successful')
      Router.push('/login')
    }

    else {
      toast.error(data.message)
    }
  }


  return (
    <div className={styles.authpage}>
      <h1>Signup</h1>


      <div className={styles.inputcontaner}>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} />
      </div>

      <div className={styles.inputcontaner}>
        <label htmlFor="name">Profile Pic</label>
        <input type="file" name="image" id="image" onChange={e => setImageFile(e.target.files![0])} />
      </div>

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
        onClick={handleSignup}
      >Signup</button>

      <Link href="/login">
        Already have an account?
      </Link>
    </div>
  )
}

export default Page