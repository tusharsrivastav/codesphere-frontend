import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const InputField = ({
  label,
  type,
  value,
  onChange,
  required,
  name,
  showPassword,
  togglePasswordVisibility,
}) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        type={showPassword ? "text" : type}
        className="w-full mt-1 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={value}
        onChange={onChange}
        required={required}
        name={name}
      />
      {togglePasswordVisibility && (
        <button
          type="button"
          className="absolute right-3 top-[50%] transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      )}
    </div>
  </div>
);

const Accounts = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [btnState, setBtnState] = useState(false);
  const navigate = useNavigate();

  document.title = "Accounts";

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/protected?email=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        setFormData((prevData) => ({
          ...prevData,
          username: data.username,
          email: data.email,
        }));
      } else {
        setErrorMessage(data.msg || "Failed to fetch user data");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch user data");
    }
  };

  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    const { currentPassword } = formData;

    try {
      setBtnState(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: currentPassword }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIsPasswordVerified(true);
        setErrorMessage("");
      } else {
        setErrorMessage(data.msg || "Password verification failed.");
      }
    } catch (error) {
      setErrorMessage("Error verifying password.");
    } finally {
      setBtnState(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    const { username } = formData;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your username?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/change-username`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newUsername: username }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Updated!",
              text: "Your username has been updated successfully.",
              icon: "success",
            }).then(() => {
              navigate("/accounts");
              location.reload();
            });
            fetchUserData();
          } else {
            setErrorMessage(data.msg || "Failed to update username");
          }
        } catch (error) {
          setErrorMessage("Error updating username");
        }
      }
    });
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    const { email } = formData;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/change-email`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newEmail: email }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Updated!",
              text: "Your email has been updated successfully.",
              icon: "success",
            }).then(() => {
              navigate("/accounts");
              location.reload();
            });
            fetchUserData();
          } else {
            setErrorMessage(data.msg || "Failed to update email");
          }
        } catch (error) {
          setErrorMessage("Error updating email");
        }
      }
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      setErrorMessage("New password and confirm password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/change-password`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newPassword, confirmPassword }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Updated!",
              text: "Your password has been updated successfully.",
              icon: "success",
            }).then(() => {
              navigate("/accounts");
              location.reload();
            });

            setFormData({
              username: "",
              email: "",
              password: "",
              newPassword: "",
              confirmPassword: "",
              currentPassword: "",
            });

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            navigate("/login");
            location.reload();
          } else {
            setErrorMessage(data.msg || "Failed to update password");
          }
        } catch (error) {
          setErrorMessage("Error updating password");
        }
      }
    });
  };

  const handleDeleteAccount = async () => {
    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          location.reload();
          return;
        }

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/account`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          if (response.ok) {
            localStorage.removeItem("token");
            Swal.fire({
              title: "Deleted!",
              text: "Your account has been deleted.",
              icon: "success",
            }).then(() => {
              navigate("/login");
              location.reload();
            });
          } else {
            setErrorMessage(data.msg || "Failed to delete account");
          }
        } catch (error) {
          setErrorMessage("Error deleting account");
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-md mx-auto my-8 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
      <h2 className="text-xl font-semibold text-center">Account Settings</h2>
      {errorMessage && (
        <p className="text-red-500 text-center">{errorMessage}</p>
      )}

      {!isPasswordVerified && (
        <form onSubmit={handlePasswordVerification}>
          <InputField
            label="Enter Current Password"
            type="password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
            name="currentPassword"
            showPassword={showCurrentPassword}
            togglePasswordVisibility={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {btnState ? "Verifying..." : "Verify Password"}
          </button>
        </form>
      )}

      {isPasswordVerified && (
        <div>
          <form onSubmit={handleUpdateUsername}>
            <InputField
              label="Username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              name="username"
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Update Username
            </button>
          </form>

          <form onSubmit={handleUpdateEmail}>
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              name="email"
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Update Email
            </button>
          </form>

          <form onSubmit={handleUpdatePassword}>
            <InputField
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              name="newPassword"
              showPassword={showNewPassword}
              togglePasswordVisibility={() =>
                setShowNewPassword(!showNewPassword)
              }
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              name="confirmPassword"
              showPassword={showConfirmPassword}
              togglePasswordVisibility={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {isPasswordVerified && (
        <div className="mt-4 text-center">
          <button
            onClick={handleDeleteAccount}
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
};

export default Accounts;
