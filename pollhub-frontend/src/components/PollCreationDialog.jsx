import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  IconButton,
  Typography,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

export default function PollCreationDialog({ open, onClose, onSubmit }) {
  // ESTADOS
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [options, setOptions] = useState(['', '']);
  const [expirationDays, setExpirationDays] = useState(7);
  const [errors, setErrors] = useState({
    question: '',
    description: '',
    options: ['', ''],
    expiration: ''
  });

  // HANDLERS
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    if (e.target.value) setErrors((err) => ({ ...err, question: '' }));
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (e.target.value.length <= 500) setErrors((err) => ({ ...err, description: '' }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);

    if (value) {
      const newErrors = { ...errors };
      newErrors.options[index] = '';
      setErrors(newErrors);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
    setErrors((err) => ({ ...err, options: [...err.options, ''] }));
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return; // Manter pelo menos 2 opções
    setOptions(options.filter((_, i) => i !== index));
    setErrors((err) => ({
      ...err,
      options: err.options.filter((_, i) => i !== index)
    }));
  };

  const handleExpirationChange = (e) => {
    const value = parseInt(e.target.value, 10) || '';
    setExpirationDays(value);

    if (value === '' || isNaN(value) || value <= 0) {
      setErrors((err) => ({ ...err, expiration: 'Por favor, insira um número válido' }));
    } else {
      setErrors((err) => ({ ...err, expiration: '' }));
    }
  };

  const handleIsPublicChange = (e) => {
    setIsPublic(e.target.checked);
  };

  // VALIDAÇÃO
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      question: '',
      description: '',
      options: options.map(() => ''),
      expiration: ''
    };

    // Pergunta
    if (!question.trim()) {
      newErrors.question = 'A pergunta é obrigatória';
      isValid = false;
    } else if (question.trim().length > 120) {
      newErrors.question = 'Máximo de 120 caracteres';
      isValid = false;
    }

    // Descrição
    if (description.length > 500) {
      newErrors.description = 'Máximo de 500 caracteres';
      isValid = false;
    }

    // Opções
    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      options.forEach((option, index) => {
        if (!option.trim()) {
          newErrors.options[index] = 'Pelo menos 2 opções são necessárias';
        }
      });
      isValid = false;
    }

    // Duração
    if (!expirationDays || expirationDays < 1 || expirationDays > 365) {
      newErrors.expiration = 'Duração inválida (1-365 dias)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // SUBMIT
  const handleSubmit = () => {
    if (!validateForm()) return;

    const pollData = {
      title: question.trim(),
      description: description.trim(),
      isPublic,
      options: options
        .filter(option => option.trim())
        .map(option => ({ text: option.trim() })),
      duration: expirationDays // Confirme se o backend espera 'duration'
    };

    onSubmit(pollData);
    resetForm();
  };

  // RESET
  const resetForm = () => {
    setQuestion('');
    setDescription('');
    setIsPublic(true);
    setOptions(['', '']);
    setExpirationDays(7);
    setErrors({
      question: '',
      description: '',
      options: ['', ''],
      expiration: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // RENDER
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <HowToVoteIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Criar Nova Enquete
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="question"
            label="Pergunta da Enquete"
            name="question"
            placeholder="Ex: Qual sua linguagem de programação favorita?"
            value={question}
            onChange={handleQuestionChange}
            error={Boolean(errors.question)}
            helperText={errors.question}
          />

          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Descrição (opcional)"
            name="description"
            placeholder="Descreva sua enquete (até 500 caracteres)"
            value={description}
            onChange={handleDescriptionChange}
            error={Boolean(errors.description)}
            helperText={errors.description}
            inputProps={{ maxLength: 500 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isPublic}
                onChange={handleIsPublicChange}
              />
            }
            label="Enquete pública"
            sx={{ mt: 1 }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Opções de Resposta
          </Typography>

          {options.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 1 }}>
              <TextField
                required
                fullWidth
                label={`Opção ${index + 1}`}
                placeholder={`Opção ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                error={Boolean(errors.options[index])}
                helperText={errors.options[index]}
                sx={{ mr: 1 }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveOption(index)}
                disabled={options.length <= 2}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddCircleIcon />}
            onClick={handleAddOption}
            sx={{ mt: 1 }}
          >
            Adicionar opção
          </Button>

          <FormControl fullWidth margin="normal" error={Boolean(errors.expiration)}>
            <TextField
              type="number"
              label="Duração da enquete (dias)"
              value={expirationDays}
              onChange={handleExpirationChange}
              InputProps={{
                inputProps: { min: 1 },
                endAdornment: <InputAdornment position="end">dias</InputAdornment>,
              }}
            />
            {errors.expiration && (
              <FormHelperText>{errors.expiration}</FormHelperText>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<HowToVoteIcon />}
        >
          Criar Enquete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
