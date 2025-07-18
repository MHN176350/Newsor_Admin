import { Box, Typography, CardContent, Input, FormControl, FormLabel, Alert, Stack, Grid } from '@mui/joy';
import { Button } from 'antd';
import { useState } from 'react';

export default function RegisterForm({ isSubmitting, errors, onSubmit, onCancel, t }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <CardContent>
      <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
        {t('users.register.subtitle')}
      </Typography>

      {errors.length > 0 && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {errors.join(', ')}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>{t('users.register.firstName')}</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('users.register.firstName')}
                />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>{t('users.register.lastName')}</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('users.register.lastName')}
                />
              </FormControl>
            </Grid>
          </Grid>

          <FormControl>
            <FormLabel>{t('users.register.username')}</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('users.register.username')}
              required
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t('users.register.email')}</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('users.register.email')}
              required
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t('users.register.password')}</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('users.register.password')}
              required
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t('users.register.confirmPassword')}</FormLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('users.register.confirmPassword')}
              required
            />
          </FormControl>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              style={{ flex: 1 }}
            >
              {isSubmitting ? t('users.register.creatingAccount') : t('users.register.createUser')}
            </Button>
            <Button onClick={onCancel} style={{ flex: 1 }}>
              {t('users.register.cancel')}
            </Button>
          </Stack>
        </Stack>
      </form>
    </CardContent>
  );
}
