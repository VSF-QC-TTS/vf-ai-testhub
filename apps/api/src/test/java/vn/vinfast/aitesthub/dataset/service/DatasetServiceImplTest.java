package vn.vinfast.aitesthub.dataset.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.mapper.DatasetMapper;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;
import vn.vinfast.aitesthub.dataset.service.impl.DatasetServiceImpl;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004
 * @since 6/20/2026
 */
@ExtendWith(MockitoExtension.class)
class DatasetServiceImplTest {

  @Mock private DatasetRepository datasetRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private UserRepository userRepository;
  @Spy private DatasetMapper datasetMapper = Mappers.getMapper(DatasetMapper.class);

  private DatasetServiceImpl datasetService;

  private final UUID projectPublicId = UUID.randomUUID();
  private final String username = "qc@test.com";
  private User mockUser;
  private Project mockProject;

  @BeforeEach
  void setUp() {
    datasetService =
        new DatasetServiceImpl(
            datasetRepository, projectRepository, userRepository, datasetMapper);

    mockUser = User.builder().id(1L).username(username).build();
    mockProject = Project.builder().id(1L).publicId(projectPublicId).owner(mockUser).build();
  }

  @Test
  void createDataset_success() {
    // Arrange
    CreateDatasetRequest request =
        new CreateDatasetRequest("Test Dataset", "Description", "E2E", null, null);

    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(mockProject));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
    when(datasetRepository.findByProjectAndName(mockProject, "Test Dataset"))
        .thenReturn(Optional.empty());

    when(datasetRepository.save(any(Dataset.class)))
        .thenAnswer(
            i -> {
              Dataset d = i.getArgument(0);
              d.setId(100L);
              d.setPublicId(UUID.randomUUID());
              return d;
            });

    // Act
    DatasetResponse response = datasetService.createDataset(projectPublicId, request, username);

    // Assert
    assertThat(response.name()).isEqualTo("Test Dataset");
    
    ArgumentCaptor<Dataset> captor = ArgumentCaptor.forClass(Dataset.class);
    verify(datasetRepository).save(captor.capture());
    Dataset saved = captor.getValue();
    assertThat(saved.getProject()).isEqualTo(mockProject);
    assertThat(saved.getCreatedBy()).isEqualTo(mockUser);
    assertThat(saved.getDescription()).isEqualTo("Description");
    assertThat(saved.getCategory()).isEqualTo("E2E");
  }

  @Test
  void createDataset_projectNotFound_throwsException() {
    CreateDatasetRequest request = new CreateDatasetRequest("Test Dataset", null, null, null, null);
    
    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> datasetService.createDataset(projectPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.PROJECT_NOT_FOUND.getCode());
  }

  @Test
  void createDataset_projectArchived_throwsException() {
    CreateDatasetRequest request = new CreateDatasetRequest("Test Dataset", null, null, null, null);
    mockProject.setArchived(true);
    
    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(mockProject));

    assertThatThrownBy(() -> datasetService.createDataset(projectPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "PROJECT_ARCHIVED");
  }

  @Test
  void createDataset_nameExists_throwsException() {
    CreateDatasetRequest request = new CreateDatasetRequest("Test Dataset", null, null, null, null);
    
    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(mockProject));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
    when(datasetRepository.findByProjectAndName(mockProject, "Test Dataset"))
        .thenReturn(Optional.of(new Dataset()));

    assertThatThrownBy(() -> datasetService.createDataset(projectPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "DATASET_NAME_EXISTS");
  }

  @Test
  void updateDataset_success() {
    // Arrange
    UUID datasetPublicId = UUID.randomUUID();
    Dataset dataset = Dataset.builder()
        .publicId(datasetPublicId)
        .project(mockProject)
        .name("Old Name")
        .build();
        
    UpdateDatasetRequest request = new UpdateDatasetRequest("New Name", "New Desc", null, null, null);
    
    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(datasetRepository.findByProjectAndName(mockProject, "New Name")).thenReturn(Optional.empty());

    // Act
    DatasetResponse response = datasetService.updateDataset(datasetPublicId, request, username);

    // Assert
    assertThat(response.name()).isEqualTo("New Name");
    assertThat(dataset.getDescription()).isEqualTo("New Desc");
  }

  @Test
  void updateDataset_archived_throwsException() {
    UUID datasetPublicId = UUID.randomUUID();
    Dataset dataset = Dataset.builder()
        .publicId(datasetPublicId)
        .project(mockProject)
        .archived(true)
        .build();
        
    UpdateDatasetRequest request = new UpdateDatasetRequest("New Name", null, null, null, null);
    
    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));

    assertThatThrownBy(() -> datasetService.updateDataset(datasetPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.DATASET_ARCHIVED.getCode());
  }

  @Test
  void archiveDataset_success() {
    UUID datasetPublicId = UUID.randomUUID();
    Dataset dataset = Dataset.builder()
        .publicId(datasetPublicId)
        .archived(false)
        .build();
        
    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));

    datasetService.archiveDataset(datasetPublicId, username);

    assertThat(dataset.isArchived()).isTrue();
  }
}
