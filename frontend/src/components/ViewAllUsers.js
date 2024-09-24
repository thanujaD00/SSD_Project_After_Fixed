import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import jsPdf from 'jspdf';
import 'jspdf-autotable';

export default function ViewAllUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function getUsers() {
            const token = localStorage.getItem("token");

            try {
                const response = await axios.post('http://localhost:8080/auth/getAllUsers', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }

        getUsers();
    }, []);

    const [filter, setFilter] = useState("");
    const [filterRole, setfilterRole] = useState("");

    function handleFilterChange(e) {
        setFilter(e.target.value);
    }

    function filterRoleOp(e) {
        setfilterRole(e.target.value);
    }

    const filteredReports = users.filter((rep) => {
        const firstNameMatches = rep.firstname && rep.firstname.toLowerCase().includes(filter.toLowerCase());
        const roleMatches = rep.role && rep.role.toLowerCase().includes(filterRole.toLowerCase());
        return firstNameMatches && roleMatches;
    });

    function generatePdf() {
        const unit = "pt";
        const size = "A3";
        const orientation = "portrait";
        const marginLeft = 40;
        const doc = new jsPdf(orientation, unit, size);

        doc.setFontSize(15);

        const title = "Doctor Appointments Table";

        const headers = [
            ["First Name", "Last Name", "Age", "Email", "DOB", "Role"]
        ];

        const data = filteredReports.map((user) => [
            user.firstname,
            user.lastname,
            user.age,
            user.email,
            user.dob,
            user.role
        ]);

        let content = {
            startY: 50,
            head: headers,
            body: data,
        };

        doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        doc.save("UserDetails.pdf");
    }

    async function deleteUser(userId) {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:8080/auth/deleteUser", { userId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("Success Delete User");
            window.location.reload();
        } catch (error) {
            alert('Delete unsuccessful: ' + error);
            console.log(error);
        }
    }

    return (
        <div className="container mx-auto p-8">
            <div className="bg-blue-500 p-8 rounded-lg">
                <h1 className="text-4xl text-white mb-4">Doctor Appointments</h1>
                <div className="flex flex-wrap justify-between space-y-4 md:space-y-0">
                    <div className="w-full md:w-1/4">
                        <div className="form-group">
                            <label htmlFor="roleFilter" className="text-white">Role Filter</label>
                            <select className="form-control" id="roleFilter" onChange={filterRoleOp}>
                                <option value="">All</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full md:w-1/4">
                        <div className="form-group">
                            <label htmlFor="search" className="text-white">Search Name</label>
                            <input type="text" className="form-control search" placeholder="Search by Name" onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className="w-full md:w-1/4">
                        <button type="button" className="btn btn-primary mt-2" onClick={generatePdf}>Download All Details</button>
                    </div>
                    <div className="w-full md:w-1/4">
                        <button type="button" className="btn btn-primary mt-2" onClick={() => { navigate(`/adminRegister`) }}>Add New User</button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-scroll mt-4">
                <table className="table table-striped table-hover" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Age</th>
                            <th scope="col">Email</th>
                            <th scope="col">DOB</th>
                            <th scope="col">Role</th>
                            <th scope="col">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map((user) => (
                            <tr key={user._id}>
                                <td>{user.firstname}</td>
                                <td>{user.lastname}</td>
                                <td>{user.age}</td>
                                <td>{user.email}</td>
                                <td>{user.dob}</td>
                                <td>{user.role}</td>
                                <td className="space-x-2">
                                    <Link to={`/updateUsers/${user._id}`}><button className="btn btn-sm text-white bg-blue-500">Update</button></Link>
                                    <button onClick={() => deleteUser(user._id)} className="btn btn-sm text-white bg-red-500">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
