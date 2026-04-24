import React, { useEffect, useState } from "react";
import api from "../api/api";
import { User } from "../types/User";

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/users");
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        
        if (err?.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Error loading users.");
        }
        
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">User List</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Account Type</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.userType}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
