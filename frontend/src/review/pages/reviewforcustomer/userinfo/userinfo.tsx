import { useEffect, useState } from "react";
import { GetUsersById } from "../../../../services/https";
import { Card } from "antd";

const customerID = Number(localStorage.getItem('id'));

export default function UserInfo() {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (customerID) {
        try {
          const res = await GetUsersById(customerID);
          if (res.status === 200) {
            setUserInfo(res.data);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }
    , [customerID]);

  return (
    <section className="userinfo-review" id="userinfo-review">
      {/* Left Side - Customer Information */}
      <div style={{ flex: '0 0 250px', background: '#003366', borderRadius: '8px', padding: '20px'}}>
        {userInfo && (
          <Card title="ประวัติส่วนตัว" bordered={false} style={{ boxShadow: '0 4px 8px rgba(235, 0, 0, 0.1)', textAlign: 'center' }}>
            {userInfo.picture && (
              <img
                src={userInfo.picture}
                alt="Profile"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '10px',
                }}
              />
            )}
            <p><strong>Customer ID:</strong> {userInfo.ID}</p>
            <p><strong>ชื่อ:</strong> {userInfo.first_name}</p>
            <p><strong>นามสกุล:</strong> {userInfo.last_name}</p>
            <p><strong>อายุ:</strong> {userInfo.age}</p>
            <p><strong>อีเมล:</strong> {userInfo.email}</p>
            <p><strong>เบอร์โทร:</strong> {userInfo.phone_number}</p>
          </Card>
        )}
      </div>

    </section>
  );
}
