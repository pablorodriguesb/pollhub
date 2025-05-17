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
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

export default function PollCreationDialog({ open, onClose, onSubmit }) {
  // Estados
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [options, setOptions] = useState(['', '']);
  const [expirationDays, setExpirationDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    question: '',
    description: '',
    options: ['', ''],
    expiration: ''
  });

  // Handlers
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

  // Validação
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

  // Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const pollData = {
        title: question.trim(),
        description: description.trim(),
        isPublic,
        options: options
          .filter(option => option.trim())
          .map(option => ({ text: option.trim() })),
        duration: expirationDays 
      };
  
      await onSubmit(pollData);
      resetForm();
    } catch (error) {
      // Erro já tratado pelo componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset
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

  // Render
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '50vh',
          borderRadius: 3,
          backgroundColor: 'hsl(220, 30%, 18%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 6,
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, background: 'transparent' }}>
        <Box display="flex" alignItems="center" sx={{ p: 2 }}>
          <Box 
            sx={{
              width: 35,
              height: 35,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <HowToVoteIcon fontSize="medium" sx={{ color: '#8A2BE2' }} />
          </Box>
          <Typography variant="h6" sx={{
            fontFamily: '"Roboto", "Segoe UI", "Arial", sans-serif',
            fontWeight: 400,
            letterSpacing: '0.5px',
            color: 'blueviolet',
            fontSize: '1.3rem'
          }}>
            Criar Nova Enquete
          </Typography>
        </Box>
      </DialogTitle>
      
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', mx: 2 }} />
      
      <DialogContent sx={{ p: 3 }}>
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
            sx={{
              '& .MuiInputBase-root': {
                color: 'rgba(255, 255, 255, 0.9)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'blueviolet',
                },
              },
              '& .MuiFormHelperText-root': {
                color: theme => theme.palette.error.main,
              }
            }}
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
            multiline
            rows={3}
            sx={{
              '& .MuiInputBase-root': {
                color: 'rgba(255, 255, 255, 0.9)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'blueviolet',
                },
              },
              '& .MuiFormHelperText-root': {
                color: theme => theme.palette.error.main,
              }
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isPublic}
                onChange={handleIsPublicChange}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-checked': {
                    color: 'blueviolet',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Enquete pública
              </Typography>
            }
            sx={{ mt: 1 }}
          />

          <Typography 
            variant="subtitle1" 
            sx={{ 
              mt: 2, 
              mb: 1, 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400
            }}
          >
            Opções de Resposta
          </Typography>

          {options.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 1 }}>
              <TextField
                required
                fullWidth
                label={`Opção ${index + 1}`}
                placeholder={`Digite a opção ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                error={Boolean(errors.options[index])}
                helperText={errors.options[index]}
                sx={{
                  mr: 1,
                  '& .MuiInputBase-root': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'blueviolet',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme => theme.palette.error.main,
                  }
                }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveOption(index)}
                disabled={options.length <= 2}
                sx={{
                  color: options.length <= 2 ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.08)',
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddCircleIcon />}
            onClick={handleAddOption}
            sx={{
              mt: 1,
              color: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(138, 43, 226, 0.08)',
              }
            }}
          >
            Adicionar opção
          </Button>

          <FormControl 
            fullWidth 
            margin="normal" 
            error={Boolean(errors.expiration)}
          >
            <TextField
              type="number"
              label="Duração da enquete (dias)"
              value={expirationDays}
              onChange={handleExpirationChange}
              InputProps={{
                inputProps: { min: 1, max: 365 },
                endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>dias</InputAdornment>,
              }}
              sx={{
                '& .MuiInputBase-root': {
                  color: 'rgba(255, 255, 255, 0.9)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'blueviolet',
                  },
                }
              }}
            />
            {errors.expiration && (
              <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
                {errors.expiration}
              </FormHelperText>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <HowToVoteIcon />}
          sx={{
            backgroundColor: 'blueviolet',
            '&:hover': {
              backgroundColor: '#9932CC',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(138, 43, 226, 0.5)',
            }
          }}
        >
          {isSubmitting ? 'Criando...' : 'Criar Enquete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}